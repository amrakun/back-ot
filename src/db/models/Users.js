import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import sha256 from 'sha256';
import jwt from 'jsonwebtoken';
import passwordValidator from 'password-validator';

import { ROLES } from '../../data/constants';
import { field } from './utils';
import { Session } from './';

const SALT_WORK_FACTOR = 10;

// User schema
export const UserSchema = mongoose.Schema({
  companyId: field({ type: String, optional: true, label: 'Company id' }),

  username: field({ type: String, label: 'Username' }),
  password: field({ type: String, optional: true, label: 'Password' }),

  registrationToken: field({ type: String, optional: true, label: 'Registration token' }),
  registrationTokenExpires: field({
    type: Date,
    optional: true,
    label: 'Registration token expire date',
  }),
  resetPasswordToken: field({ type: String, optional: true, label: 'Reset password token' }),
  resetPasswordExpires: field({
    type: Date,
    optional: true,
    label: 'Reset password token expire date',
  }),

  role: field({
    type: String,
    enum: [ROLES.ADMIN, ROLES.CONTRIBUTOR],
    optional: true,
    label: 'User role',
  }),

  isSupplier: field({ type: Boolean, optional: true, label: 'Is supplier' }),
  isActive: field({ type: Boolean, default: true, label: 'Is active' }),

  email: field({
    type: String,
    lowercase: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/, 'Please fill a valid email address'],
    label: 'Email',
  }),

  firstName: field({ type: String, optional: true, label: 'First name' }),
  lastName: field({ type: String, optional: true, label: 'Last name' }),
  jobTitle: field({ type: String, optional: true, label: 'Job title' }),
  phone: field({ type: Number, optional: true, label: 'Phone' }),

  permissions: field({ type: [String], label: 'Permissions', optional: true }),

  // temporary user to replace this user
  delegatedUserId: field({ type: String, optional: true, label: 'Delegated user' }),
  delegationStartDate: field({ type: Date, optional: true, label: 'Delegation start date' }),
  delegationEndDate: field({ type: Date, optional: true, label: 'Delegation end date' }),

  temporarySecureInformation: field({
    type: Object,
    optional: true,
    label: 'Temporary secure information',
  }),

  lastLoginDate: field({ type: Date, optional: true, label: 'Last login date' }),
});

class User {
  static getSecret() {
    return process.env.JWT_TOKEN_SECRET || '';
  }

  static validatePassword(password) {
    const schema = new passwordValidator();

    schema
      .is()
      .min(8) // Minimum length 8
      .is()
      .max(100) // Maximum length 100
      .has()
      .uppercase() // Must have uppercase letters
      .has()
      .lowercase() // Must have lowercase letters
      .has()
      .digits() // Must have digits
      .has()
      .symbols() // Must include symbols
      .has()
      .not()
      .spaces(); // Should not have spaces

    if (!schema.validate(password)) {
      throw new Error(
        `Password must have uppercase letters, lowercase letters,
          digits and symbols. Minimum length is 8`,
      );
    }
  }

  /**
   * Create new user
   * @param {Object} doc - user fields
   * @return {Promise} newly created user object
   */
  static async createUser(doc) {
    const { email, password } = doc;

    if (await this.findOne({ email })) {
      throw new Error('Duplicated email');
    }

    this.validatePassword(password);

    return this.create({
      ...doc,

      isSupplier: false,
      isActive: true,

      // hash password
      password: await this.generatePassword(password),
    });
  }

  /**
   * Update user information
   * @param {String} userId
   * @param {Object} doc - user fields
   * @return {Promise} updated user info
   */
  static async updateUser(_id, doc) {
    const { email, password } = doc;

    if (await this.findOne({ _id: { $ne: _id }, email })) {
      throw new Error('Duplicated email');
    }

    // change password
    if (password) {
      this.validatePassword(password);

      doc.password = await this.generatePassword(password);

      // if there is no password specified then leave password field alone
    } else {
      delete doc.password;
    }

    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /*
   * Update user profile
   * @param {String} _id - User id
   * @param {Object} doc - User profile information
   * @return {Promise} - Updated user
   */
  static async editProfile(_id, doc) {
    delete doc.password;

    const userOnDb = await Users.findOne({ _id });

    // changed secure information
    if (userOnDb.email !== doc.email || userOnDb.username !== doc.username) {
      if (userOnDb.email !== doc.email && (await Users.findOne({ email: doc.email }))) {
        throw new Error('Invalid email');
      }

      if (userOnDb.username !== doc.username && (await Users.findOne({ username: doc.username }))) {
        throw new Error('Invalid username');
      }

      const token = await this.generateRandomToken();

      doc.temporarySecureInformation = {
        email: doc.email,
        username: doc.username,
        token: token,
        expires: Date.now() + 86400000,
      };

      delete doc.email;
      delete doc.username;
    }

    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /*
   * Confirms profile edition by given token
   * @param {String} token - User's temporary token for profile edition
   * @return {Promise} - Updated user information
   */
  static async confirmProfileEdit(token) {
    // find user by token
    const user = await this.findOne({
      'temporarySecureInformation.token': token,
      'temporarySecureInformation.expires': {
        $gt: Date.now(),
      },
    });

    if (!user) {
      throw new Error('Token is invalid or has expired.');
    }

    // set new information
    await this.findByIdAndUpdate(
      { _id: user._id },
      {
        email: user.temporarySecureInformation.email,
        username: user.temporarySecureInformation.username,
        temporarySecureInformation: undefined,
      },
    );

    return this.findOne({ _id: user._id });
  }

  /*
   * Toggle user state
   * @param {String} _id - User id
   * @return {Promise} - updated user
   */
  static async toggleState(_id) {
    const user = await this.findOne({ _id });

    if (user.isSupplier) {
      throw new Error('Can not remove supplier');
    }

    await Users.update({ _id }, { $set: { isActive: !user.isActive } });

    return this.findOne({ _id });
  }

  /*
   * Generates new password hash using plan text password
   * @param {String} password - Plan text password
   * @return hashed password
   */
  static generatePassword(password) {
    const hashPassword = sha256(password);

    return bcrypt.hash(hashPassword, SALT_WORK_FACTOR);
  }

  /*
   * Create the random token
   */
  static async generateRandomToken() {
    const buffer = await crypto.randomBytes(20);

    return buffer.toString('hex');
  }

  /*
    Compare password
    @param {String} password
    @param {String} userPassword - Current password
    return {Boolean} is valid
  */
  static comparePassword(password, userPassword) {
    const hashPassword = sha256(password);

    return bcrypt.compare(hashPassword, userPassword);
  }

  /*
   * Resets user password by given token & password
   * @param {String} token - User's temporary token for reset password
   * @param {String} newPassword - New password
   * @return {Promise} - Updated user information
   */
  static async resetPassword({ token, newPassword }) {
    // find user by token
    const user = await this.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      throw new Error('Password reset token is invalid or has expired.');
    }

    if (!newPassword) {
      throw new Error('Password is required.');
    }

    this.validatePassword(newPassword);

    // set new password
    await this.findByIdAndUpdate(
      { _id: user._id },
      {
        password: await this.generatePassword(newPassword),
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      },
    );

    return this.findOne({ _id: user._id });
  }

  /*
   * Change user password
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @return {Promise} - Updated user information
   */
  static async changePassword({ _id, currentPassword, newPassword }) {
    const user = await this.findOne({ _id });

    // check current password ============
    const valid = await this.comparePassword(currentPassword, user.password);

    if (!valid) {
      throw new Error('Incorrect current password');
    }

    this.validatePassword(newPassword);

    // set new password
    await this.findByIdAndUpdate(
      { _id: user._id },
      {
        password: await this.generatePassword(newPassword),
      },
    );

    return this.findOne({ _id: user._id });
  }

  /*
   * Sends reset password link to found user's email
   * @param {String} email - Registered user's email
   * @return {String} - Generated token
   */
  static async forgotPassword(email) {
    // find user
    const user = await this.findOne({
      email,
      registrationToken: null,
      registrationTokenExpires: null,
    });

    if (!user) {
      throw new Error('Invalid email');
    }

    const token = await this.generateRandomToken();

    // save token & expiration date
    await this.findByIdAndUpdate(
      { _id: user._id },
      {
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 86400000,
      },
    );

    return token;
  }

  /*
   * Creates regular and refresh tokens using given user information
   * Not using refresh tokens for now
   * @param {Object} _user - User object
   * @param {String} secret - Token secret
   * @return [String] - list of tokens
   */
  static async createTokens(_user, secret) {
    const user = _user.toJSON();

    delete user.password;
    delete user.registrationToken;
    delete user.registrationTokenExpires;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;

    const createToken = await jwt.sign({ user }, secret, { expiresIn: '1d' });

    const createRefreshToken = await jwt.sign({ user }, secret, {
      expiresIn: '1d',
    });

    return [createToken, createRefreshToken];
  }

  /*
   * Renews tokens
   * @param {String} refreshToken
   * @return {Object} renewed tokens with user
   */
  static async refreshTokens(refreshToken) {
    let _id = null;

    try {
      // validate refresh token
      const { user } = jwt.verify(refreshToken, this.getSecret());

      _id = user._id;

      // if refresh token is expired then force to login
    } catch (e) {
      return {};
    }

    const user = await Users.findOne({ _id });

    // recreate tokens
    const [newToken, newRefreshToken] = await this.createTokens(user, this.getSecret());

    return {
      token: newToken,
      refreshToken: newRefreshToken,
      user,
    };
  }

  /**
   * Register
   * @param {String} email - user email
   * @return {Promise} newly created user object
   */
  static async register(rawEmail) {
    const email = rawEmail.toLowerCase();

    if (await Users.findOne({ email })) {
      throw new Error('Invalid email');
    }

    return this.create({
      username: email,
      email,
      isSupplier: true,
      isActive: true,
      registrationToken: await this.generateRandomToken(),
      registrationTokenExpires: Date.now() + 86400000,
    });
  }

  /**
   * Regenerate registration tokens
   * @param {String} email - user email
   * @return {Promise} updated user object
   */
  static async regenerateRegistrationTokens(rawEmail) {
    const email = rawEmail.toLowerCase();

    const user = await Users.findOne({
      email,
      registrationToken: { $ne: null },
      registrationTokenExpires: { $ne: null },
    });

    if (!user) {
      throw new Error('Invalid email');
    }

    await Users.update(
      { _id: user._id },
      {
        $set: {
          registrationToken: await this.generateRandomToken(),
          registrationTokenExpires: Date.now() + 86400000,
        },
      },
    );

    return this.findOne({ _id: user._id });
  }

  /*
   * Confirms user registration by given token & password
   * @param {String} token - User's temporary token for registration
   * @param {String} password - Password
   * @return {Promise} - Updated user information
   */
  static async confirmRegistration(token, password) {
    // find user by token
    const user = await this.findOne({
      registrationToken: token,
      registrationTokenExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      throw new Error('Token is invalid or has expired.');
    }

    if (!password) {
      throw new Error('Password is required.');
    }

    this.validatePassword(password);

    // set new password
    await this.findByIdAndUpdate(
      { _id: user._id },
      {
        password: await this.generatePassword(password),
        registrationToken: undefined,
        registrationTokenExpires: undefined,
      },
    );

    return this.findOne({ _id: user._id });
  }

  /*
   * Validates user credentials and generates tokens
   * @param {Object} args
   * @param {String} args.email - User email
   * @param {String} args.password - User password
   * @param {String} args.loginAs - User id to login if user is delegated his account
   * @return {Object} - generated tokens
   */
  static async login({ email, password, loginAs }) {
    let user = await Users.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') },
    });

    if (!user) {
      // user with provided email not found
      throw new Error('Invalid login');
    }

    const valid = await this.comparePassword(password, user.password);

    if (!valid) {
      // bad password
      throw new Error('Invalid login');
    }

    // if user is delegated his account then ask for which account
    // he want to use
    const now = new Date();
    const { delegatedUserId, delegationStartDate, delegationEndDate } = user;

    // checking wheter or not this delegation is active
    if (delegatedUserId && delegationStartDate <= now && delegationEndDate >= now) {
      const delegatedUser = await Users.findOne({ _id: user.delegatedUserId });

      if (!loginAs) {
        return {
          status: 'chooseLoginAs',
          user,
          delegatedUser,
        };
      }

      // check invalid loginAs value
      if ([user._id, user.delegatedUserId].includes(loginAs)) {
        user = await Users.findOne({ _id: loginAs });
      }
    }

    // create tokens
    const [token, refreshToken] = await this.createTokens(user, this.getSecret());

    user.lastLoginDate = new Date();

    await user.save();

    return {
      status: 'login',
      token,
      refreshToken,
      user,
    };
  }

  static logout(user) {
    Session.create({
      invalidToken: user && user.loginToken,
    });

    return 'loggedOut';
  }

  /*
   * Give someone your account temporarily
   * @param {String} userId - The user that is doing this action
   * @param {String} delegateUserId - The user that will have extra account
   * @param {String} startDate - Start date of delegate action
   * @param {String} endDate - End date of delegate action
   * @return {User} - Extra account received user
   */
  static async delegate({ userId, delegateUserId, startDate, endDate }) {
    const delegateUser = await this.findOne({ _id: delegateUserId });

    if (delegateUser.isSupplier) {
      throw new Error('Invalid user');
    }

    const now = new Date();

    // if this use gave his account to someone and inverval is active
    // then it is not possible to delegate again
    const previousActiveDelegation = await Users.findOne({
      delegatedUserId: userId,
      delegationStartDate: { $lte: now },
      delegationEndDate: { $gte: now },
    });

    if (previousActiveDelegation) {
      throw new Error('Already delegated');
    }

    await this.update(
      { _id: delegateUserId },
      {
        $set: {
          delegatedUserId: userId,
          delegationStartDate: startDate,
          delegationEndDate: endDate,
        },
      },
    );

    return this.findOne({ _id: delegateUserId });
  }
}

UserSchema.loadClass(User);

const Users = mongoose.model('users', UserSchema);

export default Users;
