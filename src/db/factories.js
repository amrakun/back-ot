import faker from 'faker';

import { Companies } from './models';

export const companyFactory = (params = {}) => {
  const company = new Companies({
    name: params.name || faker.random.word(),
  });

  return company.save();
};
