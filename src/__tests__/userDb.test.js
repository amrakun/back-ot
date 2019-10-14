/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import moment from 'moment';
import { connect, disconnect } from '../db/connection';
import { Users, Audits, BlockedCompanies, Feedbacks, Tenders } from '../db/models';

import {
  userFactory,
  auditFactory,
  blockedCompanyFactory,
  feedbackFactory,
  tenderFactory,
} from '../db/factories';

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
    const testPassword = 'Dombo$1234';

    delete _user._id;

    const userObj = await Users.createUser({
      ..._user,
      role: 'admin',
      email: 'test@gmail.com',
      password: testPassword,
    });

    expect(userObj).toBeDefined();
    expect(userObj._id).toBeDefined();
    expect(userObj.username).toBe(_user.username);
    expect(userObj.email).toBe('test@gmail.com');
    expect(userObj.role).toBe('admin');
    expect(userObj.isSupplier).toBe(false);
    expect(userObj.firstName).toBe(_user.firstName);
    expect(userObj.lastName).toBe(_user.lastName);
    expect(userObj.jobTitle).toBe(_user.jobTitle);
    expect(userObj.phone).toBe(_user.phone);
    expect(bcrypt.compare(testPassword, userObj.password)).toBeTruthy();
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

    const testPassword = 'updatedPass$1234';
    const testEmail = 'test@gmail.com';

    // try with password ============
    await Users.updateUser(_user._id, {
      email: testEmail,
      username: updateDoc.username,
      password: testPassword,
      firstName: updateDoc.firstName,
      lastName: updateDoc.lastName,
      jobTitle: updateDoc.jobTitle,
      phone: updateDoc.phone,
    });

    let userObj = await Users.findOne({ _id: _user._id });

    expect(userObj.username).toBe(updateDoc.username);
    expect(userObj.email).toBe(testEmail);
    expect(userObj.role).toBe(userObj.role);
    expect(userObj.firstName).toBe(updateDoc.firstName);
    expect(userObj.lastName).toBe(updateDoc.lastName);
    expect(userObj.jobTitle).toBe(updateDoc.jobTitle);
    expect(userObj.phone).toBe(updateDoc.phone);
    expect(bcrypt.compare(testPassword, userObj.password)).toBeTruthy();

    // try without password ============
    await Users.updateUser(_user._id, {
      email: testEmail,
      username: updateDoc.username,
    });

    userObj = await Users.findOne({ _id: _user._id });

    // password must stay untouched
    expect(bcrypt.compare(testPassword, userObj.password)).toBeTruthy();
  });

  test('Toggle user state', async () => {
    expect.assertions(3);

    // audit usage ===================
    await auditFactory({ createdUserId: _user._id });

    // feedback usage ===================
    await BlockedCompanies.remove({});
    await feedbackFactory({ createdUserId: _user._id });

    // can not remove a supplier ===================
    await Users.update({ _id: _user._id }, { $set: { isSupplier: true } });

    try {
      await Users.toggleState(_user._id);
    } catch (e) {
      expect(e.message).toBe('Can not remove supplier');
    }

    // successfull ==================
    await Users.update({ _id: _user._id }, { $set: { isSupplier: false } });
    await Tenders.remove({});

    const aboutToDeactivateUser = await Users.findOne({ _id: _user._id });
    expect(aboutToDeactivateUser.isActive).toBe(true);

    const deactivedUser = await Users.toggleState(_user._id);

    // deactived user
    expect(deactivedUser.isActive).toBe(false);
  });

  test('Edit profile', async () => {
    expect.assertions(13);

    const updateDoc = await userFactory();

    try {
      await Users.updateUser(_user._id, { email: updateDoc.email });
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }

    try {
      await Users.editProfile(_user._id, {
        email: updateDoc.email,
      });
    } catch (e) {
      expect(e.message).toBe('Invalid email');
    }

    try {
      await Users.editProfile(_user._id, {
        username: updateDoc.username,
      });
    } catch (e) {
      expect(e.message).toBe('Invalid username');
    }

    await Users.editProfile(_user._id, {
      email: 'test@gmail.com',
      username: _user.username,
      firstName: updateDoc.firstName,
      lastName: updateDoc.lastName,
      jobTitle: updateDoc.jobTitle,
      phone: updateDoc.phone,
    });

    const userObj = await Users.findOne({ _id: _user._id });

    // do not update secure informations right away
    expect(userObj.username).toBe(_user.username);
    expect(userObj.email).toBe(_user.email);
    expect(userObj.temporarySecureInformation.token).toBeDefined();
    expect(userObj.temporarySecureInformation.expires).toBeDefined();
    expect(userObj.temporarySecureInformation.username).toBe(_user.username);
    expect(userObj.temporarySecureInformation.email).toBe('test@gmail.com');

    expect(userObj.firstName).toBe(updateDoc.firstName);
    expect(userObj.lastName).toBe(updateDoc.lastName);
    expect(userObj.jobTitle).toBe(updateDoc.jobTitle);
    expect(userObj.phone).toBe(updateDoc.phone);
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
      newPassword: 'Password$123',
    });

    expect(user.resetPasswordToken).toBe(null);
    expect(user.resetPasswordExpires).toBe(null);
    expect(bcrypt.compare('Password$123', user.password)).toBeTruthy();
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
    expect.assertions(4);

    // invalid email ==============
    try {
      await Users.forgotPassword('test@yahoo.com');
    } catch (e) {
      expect(e.message).toBe('Invalid email');
    }

    // valid email but not confirmed
    await Users.update(
      { _id: _user._id },
      {
        $set: {
          registrationToken: 'token',
          registrationTokenExpires: new Date(),
        },
      },
    );
    try {
      await Users.forgotPassword(_user.email);
    } catch (e) {
      expect(e.message).toBe('Invalid email');
    }

    // all valid
    await Users.update(
      { _id: _user._id },
      {
        $set: {
          registrationToken: undefined,
          registrationTokenExpires: undefined,
        },
      },
    );
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

  test('Login: delegate', async () => {
    const delegatedUser = await userFactory({});

    await Users.update(
      { _id: _user._id },
      {
        $set: {
          delegatedUserId: delegatedUser._id,
          delegationStartDate: moment().add(1, 'days'),
          delegationEndDate: moment().add(2, 'days'),
        },
      },
    );

    // expired internval ======================
    let response = await Users.login({
      email: _user.email.toUpperCase(),
      password: 'pass',
    });

    expect(response.status).toBe('login');

    // without loginAs ======================
    await Users.update(
      { _id: _user._id },
      {
        $set: {
          delegationStartDate: moment().add(-1, 'days'),
          delegationEndDate: moment().add(2, 'days'),
        },
      },
    );

    response = await Users.login({
      email: _user.email.toUpperCase(),
      password: 'pass',
    });

    expect(response.status).toBe('chooseLoginAs');
    expect(response.user._id.toString()).toBe(_user._id);
    expect(response.delegatedUser._id.toString()).toBe(delegatedUser._id);

    // with loginAs ======================
    response = await Users.login({
      email: _user.email.toUpperCase(),
      password: 'pass',
      loginAs: delegatedUser._id,
    });

    expect(response.status).toBe('login');
    expect(response.user._id.toString()).toBe(delegatedUser._id);
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

  test('Regenerate registration tokens', async () => {
    expect.assertions(3);

    await Users.update(
      { _id: _user._id },
      {
        $set: {
          registrationToken: undefined,
          registrationTokenExpires: undefined,
        },
      },
    );

    const user = await Users.findOne({ _id: _user._id });

    try {
      await Users.regenerateRegistrationTokens(user.email);
    } catch (e) {
      expect(e.message).toBe('Invalid email');
    }

    await Users.update(
      { _id: _user._id },
      {
        $set: {
          registrationToken: 'token',
          registrationTokenExpires: Date.now() + 86400000,
        },
      },
    );

    const userObj = await Users.regenerateRegistrationTokens(user.email);

    expect(userObj.registrationToken).toBeDefined();
    expect(userObj.registrationTokenExpires).toBeDefined();
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
    const user = await Users.confirmRegistration('token', 'Password$123');

    expect(user.registrationToken).toBe(null);
    expect(user.registrationTokenExpires).toBe(null);
    expect(bcrypt.compare('Password$123', user.password)).toBeTruthy();
  });

  test('Confirm profile edit', async () => {
    expect.assertions(4);

    // token expired ==============
    try {
      await Users.confirmProfileEdit('token');
    } catch (e) {
      expect(e.message).toBe('Token is invalid or has expired.');
    }

    // valid token =================
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    await Users.update(
      { _id: _user._id },
      {
        $set: {
          temporarySecureInformation: {
            token: 'token',
            expires: tomorrow,
            email: 'tempemail',
            username: 'tempUsername',
          },
        },
      },
    );

    const user = await Users.confirmProfileEdit('token');

    expect(user.temporarySecureInformation).toBe(null);
    expect(user.email).toBe('tempemail');
    expect(user.username).toBe('tempUsername');
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

  test('Delegate', async () => {
    // expect.assertions(5);

    // try to give his account to supplier ================
    let userToDelegate = await userFactory({ isSupplier: true });

    try {
      await Users.delegate({
        userId: _user._id,
        delegateUserId: userToDelegate._id,
        startDate: new Date(),
        endDate: new Date(),
      });
    } catch (e) {
      expect(e.message).toBe('Invalid user');
    }

    // already delegated to some user & interval is active ================
    await Users.update({ _id: userToDelegate._id }, { $set: { isSupplier: false } });

    const alreadyDelegatedUser = await userFactory({
      delegatedUserId: _user._id,
      delegationStartDate: moment().add(-1, 'days'),
      delegationEndDate: moment().add(3, 'days'),
    });

    try {
      await Users.delegate({
        userId: _user._id,
        delegateUserId: userToDelegate._id,
        startDate: new Date(),
        endDate: new Date(),
      });
    } catch (e) {
      expect(e.message).toBe('Already delegated');
    }

    // successfull ================
    await Users.update(
      { _id: alreadyDelegatedUser._id },
      {
        $set: {
          delegationStartDate: moment().add(-2, 'days'),
          delegationEndDate: moment().add(-1, 'days'),
        },
      },
    );

    const response = await Users.delegate({
      userId: _user._id,
      delegateUserId: userToDelegate._id,
      startDate: new Date(),
      endDate: new Date(),
    });

    expect(response.delegatedUserId.toString()).toBe(_user._id);
    expect(response.delegationStartDate).toBeDefined();
    expect(response.delegationEndDate).toBeDefined();
  });
});
