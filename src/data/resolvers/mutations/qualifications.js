import { Qualifications, Companies, SuppliersByProductCodeLogs } from '../../../db/models';
import { sendConfigEmail, putUpdateLog, putCreateLog } from '../../../data/utils';
import { requireBuyer } from '../../permissions';
import { LOG_TYPES } from '../../constants';

export const generateReplacer = async (supplier, qualified) => {
  const basicInfo = supplier.basicInfo || {};
  const qualification = await Qualifications.findOne({ supplierId: supplier._id });

  const replacer = text => {
    let failedSectionsEn = '';
    let failedSectionsMn = '';
    let percentage = '';

    if (supplier.tierType === 'national') {
      percentage = '25%';
    }

    if (supplier.tierType === 'umnugovi') {
      percentage = '50%';
    }

    const collect = (status, enText, mnText) => {
      if (!status) {
        failedSectionsEn = failedSectionsEn ? `${failedSectionsEn}, ${enText}` : enText;
        failedSectionsMn = failedSectionsMn ? `${failedSectionsMn}, ${mnText}` : mnText;
      }
    };

    if (qualified === false && qualification) {
      // financial info
      const isFIPassed = Qualifications.isSectionPassed(qualification.financialInfo);

      // Business info
      const isBIPassed = Qualifications.isSectionPassed(qualification.businessInfo);

      // Environmental Management
      const isEIPassed = Qualifications.isSectionPassed(qualification.environmentalInfo);

      // Health & Safety Management System
      const isHIPassed = Qualifications.isSectionPassed(qualification.healthInfo);

      collect(isFIPassed, 'Financial information', 'Санхүүгийн мэдээлэл');
      collect(isBIPassed, 'Business integrity & human resource', 'Хүний нөөцийн удирдлага');
      collect(isEIPassed, 'Environmental management', 'Байгаль орчны удирдлага');
      collect(
        isHIPassed,
        'Health & safety management system',
        'Эрүүл мэнд, аюулгүй ажиллагааны удирдлагын систем ',
      );
    }

    return text
      .replace(/{supplier.enName}/g, basicInfo.enName || '')
      .replace(/{supplier.mnName}/g, basicInfo.mnName || '')
      .replace(/{supplier.vendorNumber}/g, basicInfo.sapNumber || '')
      .replace(/{supplier.tierType}/g, supplier.tierTypeDisplay())
      .replace(/{failedSectionsEn}/g, failedSectionsEn)
      .replace(/{failedSectionsMn}/g, failedSectionsMn)
      .replace(/{percentage}/g, percentage)
      .replace(/{supplier._id}/g, supplier._id);
  };

  return replacer;
};

const qualificationMutations = {
  /*
   * Save tier type
   */
  async qualificationsSaveTierType(root, { supplierId, tierType }, { user }) {
    const qualification = await Qualifications.findOne({ supplierId });
    const updated = await Qualifications.saveTierType(supplierId, 'tierType', tierType);

    if (qualification) {
      const companyName = await Companies.getName(supplierId);

      putUpdateLog(
        {
          type: LOG_TYPES.QUALIFICATION,
          object: { tierType: qualification.tierType },
          newData: JSON.stringify({ tierType }),
          description: `Tier type for company "${companyName}" has been changed`,
        },
        user,
      );
    }

    return updated;
  },

  /*
   * Prequalify a supplier
   */
  async qualificationsPrequalify(root, { supplierId, qualified, templateObject }, { user }) {
    const supplier = await Companies.findOne({ _id: supplierId });

    await SuppliersByProductCodeLogs.createLog(supplier);

    const { PREQUALIFICATION_STATUS_EMAILS } = process.env;

    const replacer = await generateReplacer(supplier, qualified);

    // send notification email
    await sendConfigEmail({
      templateObject,
      name: 'prequalificationTemplates',
      kind: `supplier__${qualified ? 'qualified' : 'failed'}`,
      toEmails: [supplier.basicInfo.email, ...PREQUALIFICATION_STATUS_EMAILS.split(',')],
      replacer,
    });

    const oldInfo = {
      isPrequalified: supplier.isPrequalified,
      prequalifiedDate: supplier.prequalifiedDate,
      isPrequalificationInfoEditable: supplier.isPrequalificationInfoEditable,
    };
    const prequalified = await Qualifications.prequalify(supplierId, qualified);
    const logDoc = {
      isPrequalified: qualified,
      prequalifiedDate: new Date(),
      isPrequalificationInfoEditable: false,
    };
    const companyName = await Companies.getName(supplierId);

    putUpdateLog(
      {
        type: LOG_TYPES.QUALIFICATION,
        object: oldInfo,
        newData: JSON.stringify(logDoc),
        description: `Pre-qualification status for company "${companyName}" has been changed`,
      },
      user,
    );

    return prequalified;
  },
};

const sections = ['financial', 'business', 'environmental', 'health'];

sections.forEach(section => {
  // capitalize first letter
  const capsedName = section.charAt(0).toUpperCase() + section.slice(1);
  const name = `qualificationsSave${capsedName}Info`;
  const sectionName = `${section}Info`;

  qualificationMutations[name] = async (root, args, { user }) => {
    const value = args[sectionName];
    const qualification = await Qualifications.findOne({ supplierId: args.supplierId });
    const updated = await Qualifications.updateSection(args.supplierId, sectionName, value);
    const companyName = await Companies.getName(args.supplierId);
    /**
     * If qualification exists, then updates it, else it creates a new one
     * in model helper method. Depending on that, we write create or update log here.
     */
    if (qualification) {
      putUpdateLog(
        {
          type: LOG_TYPES.QUALIFICATION,
          object: qualification[sectionName] || {},
          newData: JSON.stringify(value),
          description: `Pre-qualification info of "${companyName}" has been edited`,
        },
        user,
      );
    } else {
      putCreateLog(
        {
          type: LOG_TYPES.QUALIFICATION,
          object: updated[sectionName] || {},
          newData: JSON.stringify({
            ...value,
            supplierId: args.supplierId,
            createdDate: new Date(),
          }),
          description: `"${companyName}" has been pre-qualified`,
          extraDesc: JSON.stringify([{ supplierId: args.supplierId, name: companyName }]),
        },
        user,
      );
    }

    return updated;
  };

  requireBuyer(qualificationMutations, name);
});

requireBuyer(qualificationMutations, 'qualificationsSaveTierType');
requireBuyer(qualificationMutations, 'qualificationsPrequalify');

export default qualificationMutations;
