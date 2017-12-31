/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Users } from '../db/models';
import { userFactory } from '../db/factories';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('User db utils', () => {
  let _user;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({ email: 'Info@erxes.io' });
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
  });

  test('Create user: duplicated email', async () => {
    expect.assertions(1);

    try {
      await Users.createUser(_user);
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }
  });

  test('Create user', async () => {
    const testPassword = 'test';

    delete _user._id;

    const userObj = await Users.createUser({
      ..._user,
      role: 'admin',
      email: 'test@gmail.com',
      details: _user.details,
      password: testPassword,
    });

    expect(userObj).toBeDefined();
    expect(userObj._id).toBeDefined();
    expect(userObj.username).toBe(_user.username);
    expect(userObj.email).toBe('test@gmail.com');
    expect(userObj.role).toBe('admin');
    expect(userObj.isSupplier).toBe(false);
    expect(bcrypt.compare(testPassword, userObj.password)).toBeTruthy();
    expect(userObj.details.fullName).toBe(_user.details.fullName);
    expect(userObj.details.avatar).toBe(_user.details.avatar);
  });

  test('Update user: duplicated email', async () => {
    expect.assertions(2);

    const user = await userFactory();

    try {
      await Users.updateUser(_user._id, { email: user.email });
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }

    // valid email
    const updatedUser = await Users.updateUser(_user._id, { email: 'email@gmail.com' });

    expect(updatedUser.email).toBe('email@gmail.com');
  });

  test('Update user', async () => {
    const updateDoc = await userFactory();
    delete updateDoc._id;

    const testPassword = 'updatedPass';
    const testEmail = 'test@gmail.com';

    // try with password ============
    await Users.updateUser(_user._id, {
      email: testEmail,
      username: updateDoc.username,
      password: testPassword,
      details: updateDoc.details,
    });

    let userObj = await Users.findOne({ _id: _user._id });

    expect(userObj.username).toBe(updateDoc.username);
    expect(userObj.email).toBe(testEmail);
    expect(userObj.role).toBe(userObj.role);
    expect(bcrypt.compare(testPassword, userObj.password)).toBeTruthy();
    expect(userObj.details.fullName).toBe(updateDoc.details.fullName);
    expect(userObj.details.avatar).toBe(updateDoc.details.avatar);

    // try without password ============
    await Users.updateUser(_user._id, {
      email: testEmail,
      username: updateDoc.username,
      details: updateDoc.details,
    });

    userObj = await Users.findOne({ _id: _user._id });

    // password must stay untouched
    expect(bcrypt.compare(testPassword, userObj.password)).toBeTruthy();
  });

  test('Remove user', async () => {
    await Users.removeUser(_user._id);

    // ensure removed
    expect(await Users.find().count()).toBe(0);
  });

  test('Edit profile', async () => {
    expect.assertions(5);

    const updateDoc = await userFactory();

    try {
      await Users.updateUser(_user._id, { email: updateDoc.email });
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }

    await Users.editProfile(_user._id, {
      email: 'test@gmail.com',
      username: updateDoc.username,
      details: updateDoc.details,
    });

    const userObj = await Users.findOne({ _id: _user._id });

    expect(userObj.username).toBe(updateDoc.username);
    expect(userObj.email).toBe('test@gmail.com');
    expect(userObj.details.fullName).toBe(updateDoc.details.fullName);
    expect(userObj.details.avatar).toBe(updateDoc.details.avatar);
  });

  test('Reset password', async () => {
    expect.assertions(5);

    // token expired ==============
    try {
      await Users.resetPassword({ token: '', newPassword: '' });
    } catch (e) {
      expect(e.message).toBe('Password reset token is invalid or has expired.');
    }

    // valid tokens & invalid password =================
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    await Users.update(
      { _id: _user._id },
      {
        $set: {
          resetPasswordToken: 'token',
          resetPasswordExpires: tomorrow,
        },
      },
    );

    try {
      await Users.resetPassword({ token: 'token', newPassword: '' });
    } catch (e) {
      expect(e.message).toBe('Password is required.');
    }

    // valid
    const user = await Users.resetPassword({
      token: 'token',
      newPassword: 'password',
    });

    expect(user.resetPasswordToken).toBe(null);
    expect(user.resetPasswordExpires).toBe(null);
    expect(bcrypt.compare('password', user.password)).toBeTruthy();
  });

  test('Change password: incorrect current password', async () => {
    expect.assertions(1);

    const user = await userFactory({});

    try {
      await Users.changePassword({ _id: user._id, currentPassword: 'admin' });
    } catch (e) {
      expect(e.message).toBe('Incorrect current password');
    }
  });

  test('Change password: successful', async () => {
    const user = await userFactory({});

    const updatedUser = await Users.changePassword({
      _id: user._id,
      currentPassword: 'pass',
      newPassword: 'Lombo@123',
    });

    expect(await Users.comparePassword('Lombo@123', updatedUser.password)).toBeTruthy();
  });

  test('Forgot password', async () => {
    expect.assertions(3);

    // invalid email ==============
    try {
      await Users.forgotPassword('test@yahoo.com');
    } catch (e) {
      expect(e.message).toBe('Invalid email');
    }

    // valid
    await Users.forgotPassword(_user.email);
    const user = await Users.findOne({ email: _user.email });

    expect(user.resetPasswordToken).toBeDefined();
    expect(user.resetPasswordExpires).toBeDefined();
  });

  test('Login', async () => {
    expect.assertions(4);

    // invalid email ==============
    try {
      await Users.login({ email: 'test@yahoo.com' });
    } catch (e) {
      expect(e.message).toBe('Invalid login');
    }

    // invalid password ==============
    try {
      await Users.login({ email: _user.email, password: 'admin' });
    } catch (e) {
      expect(e.message).toBe('Invalid login');
    }

    // valid
    const { token, refreshToken } = await Users.login({
      email: _user.email.toUpperCase(),
      password: 'pass',
    });

    expect(token).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  test('Register', async () => {
    expect.assertions(8);

    try {
      await Users.register(_user.email);
    } catch (e) {
      expect(e.message).toBe('Invalid email');
    }

    const userObj = await Users.register('test@gmail.com');

    expect(userObj).toBeDefined();
    expect(userObj._id).toBeDefined();
    expect(userObj.registrationToken).toBeDefined();
    expect(userObj.registrationTokenExpires).toBeDefined();
    expect(userObj.email).toBe('test@gmail.com');
    expect(userObj.isSupplier).toBe(true);
    expect(userObj.role).toBe(undefined);
  });

  test('Confirm registration', async () => {
    expect.assertions(5);

    // token expired ==============
    try {
      await Users.confirmRegistration('', '');
    } catch (e) {
      expect(e.message).toBe('Token is invalid or has expired.');
    }

    // valid tokens & invalid password =================
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    await Users.update(
      { _id: _user._id },
      {
        $set: {
          registrationToken: 'token',
          registrationTokenExpires: tomorrow,
        },
      },
    );

    try {
      await Users.confirmRegistration('token', '');
    } catch (e) {
      expect(e.message).toBe('Password is required.');
    }

    // valid
    const user = await Users.confirmRegistration('token', 'password');

    expect(user.registrationToken).toBe(null);
    expect(user.registrationTokenExpires).toBe(null);
    expect(bcrypt.compare('password', user.password)).toBeTruthy();
  });

  test('Refresh tokens', async () => {
    expect.assertions(3);

    // invalid refresh token
    expect(await Users.refreshTokens('invalid')).toEqual({});

    // valid ==============
    const prevRefreshToken = await jwt.sign({ user: _user }, Users.getSecret(), {
      expiresIn: '7d',
    });

    const { token, refreshToken } = await Users.refreshTokens(prevRefreshToken);

    expect(token).toBeDefined();
    expect(refreshToken).toBeDefined();
  });
});
