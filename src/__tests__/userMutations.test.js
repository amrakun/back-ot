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

describe('User mutations', () => {
  const user = { _id: 'DFAFDFDFD', role: ROLES.CONTRIBUTOR };
  const _adminUser = { _id: 'fakeId', role: ROLES.ADMIN };

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

    const mutations = ['registerViaBuyer', 'usersAdd', 'usersEdit', 'usersRemove'];

    const user = await userFactory({ isSupplier: true });

    for (let mutation of mutations) {
      checkLogin(userMutations[mutation], {}, { user });
    }
  });

  test('Register', async () => {
    const mutation = `
      mutation register($email: String!) {
        register(email: $email)
      }
    `;

    await graphqlRequest(mutation, 'register', { email: 'test@erxes.io' });

    const user = await Users.findOne({ email: 'test@erxes.io' });

    expect(user._id).toBeDefined();
  });

  test('Confirm registration', async () => {
    const mutation = `
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
      password: 'pass',
      passwordConfirmation: 'pass',
    };

    const user = await userFactory({});

    // valid tokens =================
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    await Users.update(
      { _id: user._id },
      {
        $set: {
          registrationToken: 'token',
          registrationTokenExpires: tomorrow,
        },
      },
    );

    await graphqlRequest(mutation, 'confirmRegistration', args, { user });

    expect(await Companies.find({}).count()).toBe(1);
  });

  const loginMutation = `
    mutation login($email: String!, $password: String!, $loginAs: String) {
      login(email: $email, password: $password, loginAs: $loginAs) {
        status
        token
        refreshToken

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

    const response = await graphqlRequest(loginMutation, 'login', args);

    expect(response.status).toBe('login');
    expect(response.token).toBeDefined();
    expect(response.refreshToken).toBeDefined();
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

    let response = await graphqlRequest(loginMutation, 'login', args);

    expect(response.status).toBe('chooseLoginAs');
    expect(response.delegatedUser._id.toString()).toBe(delegatedUser._id);
    expect(response.user._id.toString()).toBe(user._id);

    // with loginAs ====================
    args.loginAs = delegatedUser._id;

    response = await graphqlRequest(loginMutation, 'login', args);

    expect(response.status).toBe('login');
    expect(response.token).toBeDefined();
    expect(response.refreshToken).toBeDefined();
    expect(response.user._id.toString()).toBe(delegatedUser._id);
  });

  test('Forgot password', async () => {
    Users.forgotPassword = jest.fn();

    const doc = { email: 'test@erxes.io' };

    await userMutations.forgotPassword({}, doc);

    expect(Users.forgotPassword).toBeCalledWith(doc.email);
  });

  test('Reset password', async () => {
    Users.resetPassword = jest.fn();

    const doc = { token: '2424920429402', newPassword: 'newPassword' };

    await userMutations.resetPassword({}, doc);

    expect(Users.resetPassword).toBeCalledWith(doc);
  });

  test('Change password', async () => {
    Users.changePassword = jest.fn();

    const doc = {
      currentPassword: 'currentPassword',
      newPassword: 'newPassword',
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
    checkLogin(userMutations.usersRemove, {});
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
    checkLogin(userMutations.usersRemove);
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
    Users.editProfile = jest.fn();

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

    await userMutations.usersRemove({}, { _id: removeUserId }, { user: _adminUser });

    // ensure removed
    expect(await Users.findOne({ _id: removeUserId })).toBe(null);
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

  test('Register via buyer', async () => {
    const mutation = `
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
        }
      }
    `;

    const doc = {
      companyName: 'company',
      contactPersonName: 'fullName',
      contactPersonPhone: 242424242,
      contactPersonEmail: 'test@gmail.com',
    };

    const doMutation = () => graphqlRequest(mutation, 'registerViaBuyer', doc);

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
});
