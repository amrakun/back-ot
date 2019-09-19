import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { companyFactory, userFactory } from '../db/factories';

dotenv.config();

mongoose.Promise = global.Promise;

const loadUsers = async () => {
  mongoose.connect(process.env.MONGO_URL);

  const content = fs.readFileSync(`${process.cwd()}/src/scripts/emails.txt`).toString();

  for (const line of content.split('\n')) {
    console.log('Inserting ......', line);

    try {
      const company = await companyFactory({
        basicInfo: { enName: line },
        isSentRegistrationInfo: true,
        isSentPrequalificationInfo: true,
        contactInfo: { email: line, name: line, phone: 1 },
      });

      await userFactory({ isSupplier: true, email: line, companyId: company._id });
    } catch (e) {
      console.log(e.message);
    }
  }

  await userFactory({ email: 'admin@ot.mn' });

  process.exit();
};

loadUsers();
