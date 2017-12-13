/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { ROLES } from '../data/constants';
import { Users } from '../db/models';
import { userFactory } from '../db/factories';
import userMutations from '../data/resolvers/mutations/users';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('User mutations', () => {
  const user = { _id: 'DFAFDFDFD', role: ROLES.CONTRIBUTOR };
  const _adminUser = { _id: 'fakeId', role: ROLES.ADMIN };

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
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

  test(`test if Error('Permission required') error is working as intended`, async () => {
    const checkLogin = async fn => {
      try {
        await fn({}, {}, { user });
      } catch (e) {
        expect(e.message).toEqual('Permission required');
      }
    };

    expect.assertions(1);

    // users remove
    checkLogin(userMutations.usersRemove);
  });

  test('Users add & edit: wrong password confirmation', async () => {
    expect.assertions(2);

    const doc = {
      password: 'password',
      passwordConfirmation: 'wrong',
    };

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
    const user = { _id: 'DFAFDFDFD' };

    Users.createUser = jest.fn(() => ({ _id: '_id' }));

    const doc = {
      username: 'username',
      password: 'password',
      email: 'info@erxes.io',
      role: 'admin',
      details: {},
    };

    await userMutations.usersAdd({}, { ...doc, passwordConfirmation: 'password' }, { user });

    // create user call
    expect(Users.createUser).toBeCalledWith(doc);
  });

  test('Users edit', async () => {
    const creatingUser = { _id: 'DFAFDFDFD' };

    Users.updateUser = jest.fn();

    const userId = 'DFAFDSFSDFDSF';
    const doc = {
      username: 'username',
      password: 'password',
      email: 'info@erxes.io',
      role: 'admin',
      details: {},
    };

    await userMutations.usersEdit(
      {},
      { ...doc, _id: userId, passwordConfirmation: 'password' },
      { user: creatingUser },
    );

    // update user call
    expect(Users.updateUser).toBeCalledWith(userId, doc);
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
    const user = await userFactory({});

    Users.editProfile = jest.fn();

    const doc = {
      username: 'username',
      email: 'info@erxes.io',
      details: {
        fullName: 'fullName',
      },
    };

    await userMutations.usersEditProfile({}, { ...doc, password: 'pass' }, { user });

    expect(Users.editProfile).toBeCalledWith(user._id, doc);
  });

  test('Users remove: successful', async () => {
    const removeUser = await userFactory({});
    const removeUserId = removeUser._id;

    await userMutations.usersRemove({}, { _id: removeUserId }, { user: _adminUser });

    // ensure removed
    expect(await Users.findOne({ _id: removeUserId })).toBe(null);
  });
});
