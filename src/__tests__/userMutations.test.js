/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import moment from 'moment';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { ROLES } from '../data/constants';
import { Users, Companies } from '../db/models';
import { userFactory, companyFactory } from '../db/factories';
import userMutations from '../data/resolvers/mutations/users';
import { PERMISSIONS } from '../data/constants';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('User mutations', async () => {
  let user;
  let _adminUser;

  beforeEach(async () => {
    user = await userFactory({ role: ROLES.CONTRIBUTOR });
    _adminUser = await userFactory({ role: ROLES.ADMIN });
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Companies.remove({});
  });

  test('Buyer required functions', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
      }
    };

    expect.assertions(4);

    const mutations = ['registerViaBuyer', 'usersAdd', 'usersEdit', 'usersToggleState'];

    const user = await userFactory({ isSupplier: true });

    for (let mutation of mutations) {
      checkLogin(userMutations[mutation], {}, { user });
    }
  });

  test('Login required functions', async () => {
    const checkLogin = async (fn, args, context) => {
      try {
        await fn({}, args, context);
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    expect.assertions(5);

    const mutations = [
      'logout',
      'confirmProfileEdit',
      'usersChangePassword',
      'usersEditProfile',
      'usersDelegate',
    ];

    for (let mutation of mutations) {
      checkLogin(userMutations[mutation], {}, {});
    }
  });

  test('Register', async () => {
    const mutation = `
      mutation register($email: String!) {
        register(email: $email)
      }
    `;

    await graphqlRequest(mutation, 'register', { email: 'test@erxes.io' }, {});

    const user = await Users.findOne({ email: 'test@erxes.io' });

    expect(user._id).toBeDefined();
  });

  test('Resend confirmation link', async () => {
    const user = await userFactory({});

    await Users.update(
      { _id: user._id },
      {
        $set: {
          registrationToken: 'token',
          registrationTokenExpires: new Date(),
        },
      },
    );

    const mutation = `
      mutation resendConfirmationLink($email: String!) {
        resendConfirmationLink(email: $email)
      }
    `;

    const link = await graphqlRequest(
      mutation,
      'resendConfirmationLink',
      { email: user.email },
      {},
    );

    expect(link).toBeDefined();
  });

  const confirmMutation = `
    mutation confirmRegistration(
      $token: String!,
      $password: String!,
      $passwordConfirmation: String!,
    ) {
      confirmRegistration(
        token: $token,
        password: $password,
        passwordConfirmation: $passwordConfirmation
      ) {
        _id
      }
    }
  `;

  const args = {
    token: 'token',
    password: 'Password$123',
    passwordConfirmation: 'Password$123',
  };

  // valid tokens =================
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  test('Confirm registration: via supplier', async () => {
    const user = await userFactory({ isSupplier: true });

    await Users.update(
      { _id: user._id },
      {
        $set: {
          companyId: null,
          registrationToken: 'token',
          registrationTokenExpires: tomorrow,
        },
      },
    );

    await graphqlRequest(confirmMutation, 'confirmRegistration', args, {});

    const updatedUser = await Users.findOne({ _id: user._id });

    expect(updatedUser.companyId).not.toBe(null);
  });

  test('Confirm registration: via buyer', async () => {
    const user = await userFactory({});
    const company = await companyFactory({});

    await Users.update(
      { _id: user._id },
      {
        $set: {
          companyId: company._id,
          registrationToken: 'token',
          registrationTokenExpires: tomorrow,
        },
      },
    );

    await graphqlRequest(confirmMutation, 'confirmRegistration', args, {});

    const updatedUser = await Users.findOne({ _id: user._id });

    expect(updatedUser.companyId.toString()).toBe(company._id);
  });

  const loginMutation = `
    mutation login($email: String!, $password: String!, $loginAs: String) {
      login(email: $email, password: $password, loginAs: $loginAs) {
        status

        delegatedUser {
          _id
        }

        user {
          _id
        }
      }
    }
  `;

  test('Login', async () => {
    const user = await userFactory({});

    const args = {
      email: user.email,
      password: 'pass',
    };

    const response = await graphqlRequest(loginMutation, 'login', args, {
      res: { cookie: () => {} },
    });

    expect(response.status).toBe('login');
  });

  test('Login: delegation', async () => {
    const delegatedUser = await userFactory({});

    const user = await userFactory({
      delegatedUserId: delegatedUser._id,
      delegationStartDate: moment().add(-1, 'days'),
      delegationEndDate: moment().add(1, 'days'),
    });

    // without loginAs ====================
    const args = {
      email: user.email,
      password: 'pass',
    };

    let response = await graphqlRequest(loginMutation, 'login', args, {
      res: { cookie: () => {} },
    });

    expect(response.status).toBe('chooseLoginAs');
    expect(response.delegatedUser._id.toString()).toBe(delegatedUser._id);
    expect(response.user._id.toString()).toBe(user._id);

    // with loginAs ====================
    args.loginAs = delegatedUser._id;

    response = await graphqlRequest(loginMutation, 'login', args, { res: { cookie: () => {} } });

    expect(response.status).toBe('login');
    expect(response.user._id.toString()).toBe(delegatedUser._id);
  });

  test('Forgot password', async () => {
    Users.forgotPassword = jest.fn();

    const doc = { email: 'test@erxes.io' };

    await userMutations.forgotPassword({}, doc, {});

    expect(Users.forgotPassword).toBeCalledWith(doc.email);
  });

  test('Reset password: buyer', async () => {
    const user = await userFactory({});
    const token = '2424920429402';

    await Companies.remove({});

    await Users.update(
      { _id: user._id },
      {
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 86400000,
      },
    );

    const doc = { token: '2424920429402', newPassword: 'Password$123' };

    await userMutations.resetPassword({}, doc, {});

    expect(await Companies.count()).toBe(0);
  });

  test('Reset password: supplier', async () => {
    const user = await userFactory({ isSupplier: true });
    const token = '2424920429402';

    await Companies.remove({});

    await Users.update(
      { _id: user._id },
      {
        companyId: null,
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 86400000,
      },
    );

    const doc = { token: '2424920429402', newPassword: 'Password$123' };

    await userMutations.resetPassword({}, doc, {});

    expect(await Companies.count()).toBe(1);
  });

  test('Change password', async () => {
    Users.changePassword = jest.fn();

    const doc = {
      currentPassword: 'currentPassword',
      newPassword: 'Password$123',
    };

    const user = { _id: 'DFAFASD' };

    await userMutations.usersChangePassword({}, doc, { user });

    expect(Users.changePassword).toBeCalledWith({ _id: user._id, ...doc });
  });

  test('Login required checks', async () => {
    const checkLogin = async (fn, args) => {
      try {
        await fn({}, args, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    expect.assertions(5);

    // users change password
    checkLogin(userMutations.usersChangePassword, {});

    // users add
    checkLogin(userMutations.usersAdd, {});

    // users edit
    checkLogin(userMutations.usersEdit, {});

    // users edit profile
    checkLogin(userMutations.usersEditProfile, {});

    // users remove
    checkLogin(userMutations.usersToggleState, {});
  });

  test(`test if Error('Current action is forbidden') error is working as intended`, async () => {
    const checkLogin = async fn => {
      try {
        await fn({}, {}, { user });
      } catch (e) {
        expect(e.message).toEqual('Current action is forbidden');
      }
    };

    expect.assertions(3);

    // admin required actions
    checkLogin(userMutations.usersToggleState);
    checkLogin(userMutations.usersAdd);
    checkLogin(userMutations.usersEdit);
  });

  test('Users add & edit: wrong password confirmation', async () => {
    expect.assertions(2);

    const doc = {
      password: 'password',
      passwordConfirmation: 'wrong',
    };

    user.role = 'admin';

    try {
      await userMutations.usersAdd({}, doc, { user });
    } catch (e) {
      expect(e.message).toBe('Incorrect password confirmation');
    }

    try {
      await userMutations.usersEdit({}, doc, { user });
    } catch (e) {
      expect(e.message).toBe('Incorrect password confirmation');
    }
  });

  test('Users add', async () => {
    Users.createUser = jest.fn();

    const mutation = `
      mutation usersAdd(
        $username: String!,
        $email: String!,
        $role: String!,

        $firstName: String,
        $lastName: String,
        $jobTitle: String,
        $phone: Float,

        $password: String!,
        $passwordConfirmation: String!,
        $permissions: [String!]
      ) {
        usersAdd(
          username: $username,
          email: $email,
          role: $role,
          firstName: $firstName,
          lastName: $lastName,
          jobTitle: $jobTitle,
          phone: $phone,


          password: $password,
          passwordConfirmation: $passwordConfirmation,
          permissions: $permissions,
        ) {
          _id
          username
          email
          role
          firstName
          lastName
          jobTitle
          phone
          permissions
        }
      }
    `;

    const args = {
      username: 'username',
      email: 'info@erxes.io',
      role: 'admin',
      firstName: '',
      lastName: '',
      jobTitle: '',
      phone: 4242422,
      password: 'password',
      passwordConfirmation: 'password',
      permissions: [PERMISSIONS[2].permissions[0]],
    };

    await graphqlRequest(mutation, 'usersAdd', args, { user: { role: 'admin' } });

    // create user call
    expect(Users.createUser).toBeCalledWith(args);
  });

  test('Users edit', async () => {
    Users.updateUser = jest.fn();

    const mutation = `
      mutation usersEdit(
        $_id: String!,
        $username: String!,
        $email: String!,
        $role: String!,

        $firstName: String,
        $lastName: String,
        $jobTitle: String,
        $phone: Float,

        $password: String,
        $passwordConfirmation: String
      ) {
        usersEdit(
          _id: $_id,
          username: $username,
          email: $email,
          role: $role,

          firstName: $firstName,
          lastName: $lastName,
          jobTitle: $jobTitle,
          phone: $phone,

          password: $password,
          passwordConfirmation: $passwordConfirmation
        ) {
          _id
        }
      }
    `;

    const args = {
      username: 'username',
      email: 'info@erxes.io',
      role: 'admin',
      firstName: '',
      lastName: '',
      jobTitle: '',
      phone: 4242422,
    };

    const context = { user: { role: 'admin' } };

    await graphqlRequest(mutation, 'usersEdit', { _id: user._id, ...args }, context);

    // create user call
    expect(Users.updateUser).toBeCalledWith(user._id, args);
  });

  test('Users edit profile: invalid password', async () => {
    expect.assertions(1);

    const user = await userFactory({ password: 'p' });

    try {
      await userMutations.usersEditProfile({}, { password: 'password' }, { user });
    } catch (e) {
      expect(e.message).toBe('Invalid password');
    }
  });

  test('Users edit profile: successfull', async () => {
    Users.editProfile = jest.fn(() => ({ _id: Math.random() }));

    const mutation = `
      mutation usersEditProfile(
        $username: String!,
        $email: String!,

        $firstName: String,
        $lastName: String,
        $jobTitle: String,
        $phone: Float,

        $password: String!,
      ) {
        usersEditProfile(
          username: $username,
          email: $email,

          firstName: $firstName,
          lastName: $lastName,
          jobTitle: $jobTitle,
          phone: $phone,

          password: $password,
        ) {
          _id
        }
      }
    `;

    const args = {
      username: 'username',
      email: 'info@erxes.io',
      password: 'pass',
      firstName: '',
      lastName: '',
      jobTitle: '',
      phone: 4242422,
    };

    const _user = await userFactory();
    const context = { user: _user };

    await graphqlRequest(mutation, 'usersEditProfile', args, context);

    // create user call
    expect(Users.editProfile).toBeCalledWith(_user._id, args);
  });

  test('Users remove: successful', async () => {
    const removeUser = await userFactory({});
    const removeUserId = removeUser._id;

    await userMutations.usersToggleState({}, { _id: removeUserId }, { user: _adminUser });

    // ensure removed
    const deactivatedUser = await Users.findOne({ _id: removeUserId });
    expect(deactivatedUser.isActive).toBe(false);
  });

  test('delegate', async () => {
    const mutation = `
      mutation usersDelegate(
        $userId: String!,
        $reason: String!,
        $startDate: Date!,
        $endDate: Date!,
      ) {
        usersDelegate(
          userId: $userId,
          reason: $reason,
          startDate: $startDate,
          endDate: $endDate,
        ) {
          _id
          delegatedUserId
          delegationStartDate
          delegationEndDate
        }
      }
    `;

    const userToDelegate = await userFactory({});

    const args = {
      userId: userToDelegate._id,
      reason: 'reason',
      startDate: new Date(),
      endDate: new Date(),
    };

    const _user = await userFactory();
    const context = { user: _user };

    let response = await graphqlRequest(mutation, 'usersDelegate', args, context);

    expect(response.delegatedUserId.toString()).toBe(_user._id);
    expect(response.delegationStartDate).toBeDefined();
    expect(response.delegationEndDate).toBeDefined();
  });

  const registerViaBuyerMutation = `
    mutation registerViaBuyer(
      $companyName: String!,
      $contactPersonName: String!,
      $contactPersonPhone: String!,
      $contactPersonEmail: String!,
    ) {
      registerViaBuyer(
        companyName: $companyName,
        contactPersonName: $contactPersonName,
        contactPersonPhone: $contactPersonPhone,
        contactPersonEmail: $contactPersonEmail,
      ) {
        user {
          _id
        }

        company {
          _id

          basicInfo {
            enName
          }

          contactInfo {
            name
            phone
            email
          }
        }
        warning
      }
    }
  `;

  test('Register via buyer', async () => {
    const doc = {
      companyName: 'company',
      contactPersonName: 'fullName',
      contactPersonPhone: 242424242,
      contactPersonEmail: 'test@gmail.com',
    };

    const doMutation = () => graphqlRequest(registerViaBuyerMutation, 'registerViaBuyer', doc);

    // check user email existance ========
    await userFactory({ email: doc.contactPersonEmail });

    expect.assertions(8);

    try {
      await doMutation();
    } catch (e) {
      expect(e.toString()).toBe('GraphQLError: Invalid email');
    }

    // check company existance ========
    await Users.remove({});
    await companyFactory({ enName: doc.companyName });

    try {
      await doMutation();
    } catch (e) {
      expect(e.toString()).toBe('GraphQLError: Company already exists');
    }

    // successfull ==============
    await Companies.remove({});
    const response = await doMutation();

    expect(response.user._id).toBeDefined();

    expect(response.company._id).toBeDefined();
    expect(response.company.basicInfo.enName).toBe(doc.companyName);
    expect(response.company.contactInfo.name).toBe(doc.contactPersonName);
    expect(response.company.contactInfo.phone).toBe(doc.contactPersonPhone);
    expect(response.company.contactInfo.email).toBe(doc.contactPersonEmail);
  });

  test('Register via buyer: hasIncompleteData', async () => {
    const doc = {
      companyName: 'company',
      contactPersonName: 'fullName',
      contactPersonPhone: 242424242,
      contactPersonEmail: 'test@gmail.com',
    };

    const doMutation = () => graphqlRequest(registerViaBuyerMutation, 'registerViaBuyer', doc);

    const company = await Companies.create({ createdDate: new Date() });
    await userFactory({ email: doc.contactPersonEmail, companyId: company._id });

    const response = await doMutation();

    expect(response.warning).toBe(`The user with "${doc.contactPersonEmail}" email already exists`);
    expect(response.user._id).toBeDefined();
    expect(response.company._id).toBeDefined();
    expect(response.company.basicInfo.enName).toBe(doc.companyName);
    expect(response.company.contactInfo.name).toBe(doc.contactPersonName);
    expect(response.company.contactInfo.phone).toBe(doc.contactPersonPhone);
    expect(response.company.contactInfo.email).toBe(doc.contactPersonEmail);
  });
});
