/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { graphqlRequest, connect, disconnect } from '../db/connection';
import { ROLES } from '../data/constants';
import { Users, Companies } from '../db/models';
import { userFactory } from '../db/factories';
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
  });

  test('Register', async () => {
    Users.register = jest.fn(() => ({ _id: '_id' }));

    const mutation = `
      mutation register($email: String!) {
        register(email: $email)
      }
    `;

    await graphqlRequest(mutation, 'register', { email: 'test@erxes.io' });

    // register must be called
    expect(Users.register).toBeCalledWith('test@erxes.io');
  });

  test('Confirm registration', async () => {
    Users.confirmRegistration = jest.fn(() => ({ _id: '_id' }));
    Companies.createCompany = jest.fn(() => ({ _id: '_id' }));

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
      password: 'password',
      passwordConfirmation: 'password',
    };

    await graphqlRequest(mutation, 'confirmRegistration', args);

    // confirmRegistration must be called
    expect(Users.confirmRegistration).toBeCalledWith(args.token, args.password);

    // create company must be called
    expect(Companies.createCompany).toBeCalledWith('_id');
  });

  test('Login', async () => {
    Users.login = jest.fn();

    const doc = { email: 'test@erxes.io', password: 'password' };

    await userMutations.login({}, doc);

    expect(Users.login).toBeCalledWith(doc);
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

  test(`test if Error('Permission denied') error is working as intended`, async () => {
    const checkLogin = async fn => {
      try {
        await fn({}, {}, { user });
      } catch (e) {
        expect(e.message).toEqual('Permission denied');
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
});
