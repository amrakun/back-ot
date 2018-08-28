import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Companies } from '../db/models';

dotenv.config();

mongoose.Promise = global.Promise;

export const customCommand = async () => {
  mongoose.connect(process.env.MONGO_URL, { useMongoClient: true });

  const companies = await Companies.find({});

  for (const company of companies) {
    if (company.financialInfo && company.financialInfo.currency) {
      const currency = company.financialInfo.currency;

      console.log('updating....', currency, company._id);

      let value;

      if (currency === 'Tugrug (MNT)') {
        value = 'MNT';
      }

      if (currency === 'Dollar – United States (USD)') {
        value = 'USD';
      }

      if (currency === 'Euro (EUR)') {
        value = 'EUR';
      }

      if (value) {
        await Companies.update({ _id: company._id }, { $set: { 'financialInfo.currency': value } });
      }
    }
  }

  mongoose.connection.close();
};

customCommand();
