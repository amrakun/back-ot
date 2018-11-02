import { Qualifications, Companies, SuppliersByProductCodeLogs } from '../../../db/models';
import { sendConfigEmail } from '../../../data/utils';
import { requireBuyer } from '../../permissions';

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

    if (supplier.tierType === 'umnugobi') {
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
  qualificationsSaveTierType(root, { supplierId, tierType }) {
    return Qualifications.saveTierType(supplierId, 'tierType', tierType);
  },

  /*
   * Prequalify a supplier
   */
  async qualificationsPrequalify(root, { supplierId, qualified, templateObject }) {
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

    return Qualifications.prequalify(supplierId, qualified);
  },
};

const sections = ['financial', 'business', 'environmental', 'health'];

sections.forEach(section => {
  // capitalize first letter
  const capsedName = section.charAt(0).toUpperCase() + section.slice(1);

  const name = `qualificationsSave${capsedName}Info`;
  const sectionName = `${section}Info`;

  qualificationMutations[name] = (root, args) => {
    const value = args[`${section}Info`];
    return Qualifications.updateSection(args.supplierId, sectionName, value);
  };

  requireBuyer(qualificationMutations, name);
});

requireBuyer(qualificationMutations, 'qualificationsSaveTierType');
requireBuyer(qualificationMutations, 'qualificationsPrequalify');

export default qualificationMutations;
