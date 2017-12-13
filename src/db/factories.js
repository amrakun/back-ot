import faker from 'faker';

import { Companies, Users } from './models';

export const companyFactory = (params = {}) => {
  const company = new Companies({
    enName: params.enName || faker.random.word(),
    mnName: params.mnName || faker.random.word(),
  });

  return company.save();
};

export const userFactory = (params = {}) => {
  const user = new Users({
    username: params.username || faker.internet.userName(),
    role: params.role || 'contributor',
    details: {
      fullName: params.fullName || faker.random.word(),
      avatar: params.avatar || faker.image.imageUrl(),
    },
    email: params.email || faker.internet.email(),
    password: params.password || '$2a$10$qfBFBmWmUjeRcR.nBBfgDO/BEbxgoai5qQhyjsrDUMiZC6dG7sg1q',
    isSupplier: params.isSupplier || false,
  });

  return user.save();
};
