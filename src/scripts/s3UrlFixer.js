import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Companies } from '../db/models';

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

  const replace = async (company, section, name) => {
    let value = company[section];

    if (name) {
      value = (company[section] || {})[name];
    }

    if (!value) {
      return;
    }

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

    let selector = section;

    if (name) {
      selector = `${section}.${name}`;
    }

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

  mongoose.connection.close();
};

customCommand();
