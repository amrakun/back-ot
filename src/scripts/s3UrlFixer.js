import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Companies, Tenders, TenderResponses } from '../db/models';

dotenv.config();

mongoose.Promise = global.Promise;

export const customCommand = async () => {
  mongoose.connect(process.env.MONGO_URL);

  const replaceUrl = file => {
    if (!file) {
      return file;
    }

    if (!file.url) {
      return file;
    }

    return {
      name: file.name,
      url: file.url.replace('https://ot-supplier.s3.amazonaws.com/', ''),
    };
  };

  const generateModifier = value => {
    let modifier;

    if (value instanceof Array) {
      modifier = [];

      for (const item of value) {
        // value = attachments: [{ name: 'name', url: 'url' }, ...]
        if (item.url) {
          modifier.push(replaceUrl(item));

          // value = recordsInfo: [{ date: 'Date', file: { name: 'name', url: 'url' } }, ...]
        } else {
          item.file = replaceUrl(item.file);
          modifier.push(item);
        }
      }

      // file: FileSchema
    } else {
      modifier = replaceUrl(value);
    }

    return modifier;
  };

  const replace = async (company, section, name) => {
    let value = company[section];

    if (name) {
      value = (company[section] || {})[name];
    }

    if (!value) {
      return;
    }

    let selector = section;

    if (name) {
      selector = `${section}.${name}`;
    }

    const modifier = generateModifier(value);

    return Companies.update({ _id: company._id }, { $set: { [selector]: modifier } });
  };

  const companies = await Companies.find({});

  for (const company of companies) {
    await replace(company, 'basicInfo', 'certificateOfRegistration');

    await replace(company, 'shareholderInfo', 'attachments');

    await replace(company, 'groupInfo', 'attachments');

    await replace(company, 'certificateInfo', 'file');

    await replace(company, 'financialInfo', 'recordsInfo');

    // business info
    await replace(company, 'businessInfo', 'doesMeetMinimumStandartsFile');
    await replace(company, 'businessInfo', 'doesHaveJobDescriptionFile');
    await replace(company, 'businessInfo', 'doesHaveLiabilityInsuranceFile');
    await replace(company, 'businessInfo', 'doesHaveCodeEthicsFile');
    await replace(company, 'businessInfo', 'doesHaveResponsiblityPolicyFile');
    await replace(company, 'businessInfo', 'organizationChartFile');

    // environmental info
    await replace(company, 'environmentalInfo', 'doesHavePlanFile');
    await replace(company, 'environmentalInfo', 'investigationDocumentation');

    // health info
    await replace(company, 'healthInfo', 'doesHaveHealthSafetyFile');
    await replace(company, 'healthInfo', 'areHSEResourcesClearlyIdentifiedFile');
    await replace(company, 'healthInfo', 'doesHaveDocumentedProcessToEnsureFile');
    await replace(company, 'healthInfo', 'areEmployeesUnderYourControlFile');
    await replace(company, 'healthInfo', 'doesHaveDocumentForRiskAssesmentFile');
    await replace(company, 'healthInfo', 'doesHaveDocumentForIncidentInvestigationFile');
    await replace(company, 'healthInfo', 'doesHaveDocumentedFitnessFile');

    await replace(company, 'dueDiligences');
  }

  const tenders = await Tenders.find({});
  const responses = await TenderResponses.find({});

  const replaceTender = async (object, name, type = 'tender') => {
    let value = object[name];

    if (!value) {
      return;
    }

    const modifier = generateModifier(value);

    if (type === 'tender') {
      return Tenders.update({ _id: object._id }, { $set: { [name]: modifier } });
    } else {
      return TenderResponses.update({ _id: object._id }, { $set: { [name]: modifier } });
    }
  };

  for (const tender of tenders) {
    await replaceTender(tender, 'file');
    await replaceTender(tender, 'attachments');
  }

  for (const response of responses) {
    await replaceTender(response, 'respondedFiles', 'response');
    await replaceTender(response, 'respondedDocuments', 'response');
    await replaceTender(response, 'respondedProducts', 'response');
  }

  mongoose.connection.close();
};

customCommand();
