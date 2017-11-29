import faker from 'faker';

import { Companies } from './models';

export const companyFactory = (params = {}) => {
  const company = new Companies({
    enName: params.enName || faker.random.word(),
    mnName: params.mnName || faker.random.word(),
  });

  return company.save();
};
