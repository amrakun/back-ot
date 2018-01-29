import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import sha256 from 'sha256';
import jwt from 'jsonwebtoken';
import { ROLES } from '../../data/constants';
import { field } from './utils';
import { Audits, BlockedCompanies, Feedbacks, Tenders } from './';

const SALT_WORK_FACTOR = 10;

// User schema
const UserSchema = mongoose.Schema({
  companyId: field({ type: mongoose.Schema.Types.ObjectId, optional: true }),

  username: field({ type: String }),
  password: field({ type: String, optional: true }),

  registrationToken: field({ type: String, optional: true }),
  registrationTokenExpires: field({ type: Date, optional: true }),
  resetPasswordToken: field({ type: String, optional: true }),
  resetPasswordExpires: field({ type: Date, optional: true }),

  role: field({
    type: String,
    enum: [ROLES.ADMIN, ROLES.CONTRIBUTOR],
    optional: true,
  }),

  isSupplier: field({ type: Boolean, optional: true }),

  email: field({
    type: String,
    lowercase: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  }),

  firstName: field({ type: String, optional: true }),
  lastName: field({ type: String, optional: true }),
  jobTitle: field({ type: String, optional: true }),
  phone: field({ type: Number, optional: true }),

  permissions: [field({ type: String, optional: false })],
});

class User {
  static getSecret() {
    return 'dfjklsafjjekjtejifjidfjsfd';
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

    return this.create({
      ...doc,

      isSupplier: false,

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

    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /*
   * Remove user
   * @param {String} _id - User id
   * @return {Promise} - remove method response
   */
  static async removeUser(_id) {
    const user = await this.findOne({ _id });

    if (user.isSupplier) {
      throw new Error('Can not remove supplier');
    }

    if (await Audits.findOne({ createdUserId: _id })) {
      throw new Error('Unable to remove. Used in audit');
    }

    if (await BlockedCompanies.findOne({ createdUserId: _id })) {
      throw new Error('Unable to remove. Used in block list');
    }

    if (await Feedbacks.findOne({ createdUserId: _id })) {
      throw new Error('Unable to remove. Used in success feedback');
    }

    if (await Tenders.findOne({ createdUserId: _id })) {
      throw new Error('Unable to remove. Used in tender');
    }

    return Users.remove({ _id });
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
    const user = await this.findOne({ email });

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
   * @param {Object} _user - User object
   * @param {String} secret - Token secret
   * @return [String] - list of tokens
   */
  static async createTokens(user, secret) {
    delete user.password;
    delete user.registrationToken;
    delete user.registrationTokenExpires;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;

    const createToken = await jwt.sign({ user }, secret, { expiresIn: '20m' });

    const createRefreshToken = await jwt.sign({ user }, secret, { expiresIn: '7d' });

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
  static async register(email) {
    if (await Users.findOne({ email })) {
      throw new Error('Invalid email');
    }

    return this.create({
      username: email,
      email,
      isSupplier: true,
      registrationToken: await this.generateRandomToken(),
      registrationTokenExpires: Date.now() + 86400000,
    });
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
   * @return {Object} - generated tokens
   */
  static async login({ email, password }) {
    const user = await Users.findOne({ email: { $regex: new RegExp(email, 'i') } });

    if (!user) {
      // user with provided email not found
      throw new Error('Invalid login');
    }

    const valid = await this.comparePassword(password, user.password);

    if (!valid) {
      // bad password
      throw new Error('Invalid login');
    }

    // create tokens
    const [token, refreshToken] = await this.createTokens(user, this.getSecret());

    return {
      token,
      refreshToken,
    };
  }
}

UserSchema.loadClass(User);

const Users = mongoose.model('users', UserSchema);

export default Users;
