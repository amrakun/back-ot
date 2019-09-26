import { Users, Companies } from '../../../db/models';
import utils, { putCreateLog, putDeleteLog, putUpdateLog } from '../../../data/utils';
import { requireLogin, requireLogout, requireBuyer } from '../../permissions';
import { LOG_TYPES } from '../../constants';

const registrationEmail = async user => {
  // send email ==============
  const { MAIN_APP_DOMAIN } = process.env;

  const link = `${MAIN_APP_DOMAIN}/confirm-registration?token=${user.registrationToken}`;

  utils.sendEmail({
    toEmails: [user.email],
    subject: 'Registration',
    template: {
      name: 'registration',
      data: {
        content: link,
      },
    },
  });

  return { user, link };
};

const register = async email => {
  const user = await Users.register(email);

  return registrationEmail(user);
};

const userMutations = {
  /**
   * Register
   * @param {string} email - User email
   * @returns - Confirmation link
   */
  async register(root, { email }) {
    const { link } = await register(email);

    return link;
  },

  /*
   * Resend confirmation link
   * @param {String} email - User email
   * @return - Confirmation link
   */
  async resendConfirmationLink(root, { email }) {
    const user = await Users.regenerateRegistrationTokens(email);

    await registrationEmail(user);

    return 'sent';
  },

  /*
   * Register via buyer
   * @param {String} companyName - Company name
   * @param {String} contactPersonName - Contact person name
   * @param {String} contactPersonPhone - Contact person phone
   * @param {String} contactPersonEmail - Contact person email
   * @return - Newly created company
   */
  async registerViaBuyer(root, args) {
    const { companyName, contactPersonName, contactPersonPhone, contactPersonEmail } = args;

    // check company duplication
    if (await Companies.findOne({ 'basicInfo.enName': companyName })) {
      throw new Error('Company already exists');
    }

    const { user } = await register(contactPersonEmail);

    // create company for new user
    const company = await Companies.createCompany(user._id, {
      basicInfo: {
        enName: companyName,
      },

      contactInfo: {
        name: contactPersonName,
        phone: contactPersonPhone,
        email: contactPersonEmail,
      },
    });

    return { user, company };
  },

  /*
   * Confirm registration
   * @param {String} token - Temporary token
   * @param {String} password - User password
   * @return - Updated user object
   */
  async confirmRegistration(root, args) {
    const { password, passwordConfirmation, token } = args;

    if (password !== passwordConfirmation) {
      throw new Error('Incorrect password confirmation');
    }

    const user = await Users.confirmRegistration(token, password);

    // if user is not registered via buyer then create company for new user
    if (user.isSupplier && !user.companyId) {
      await Companies.createCompany(user._id);
    }

    return user;
  },

  /*
   * Confirm profile edit
   * @param {String} token - Temporary token
   * @return - Updated user object
   */
  async confirmProfileEdit(root, args) {
    const { token } = args;

    return Users.confirmProfileEdit(token);
  },

  /**
   * Login
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {string} tokens.token - Token to use authenticate against graphql endpoints
   * @returns {string} tokens.refreshToken - Token to use refresh expired token
   */
  async login(root, args, { res }) {
    const response = await Users.login(args);

    const { token } = response;

    const oneDay = 1 * 24 * 3600 * 1000; // 1 day

    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + oneDay),
      maxAge: oneDay,
    };

    const { NODE_ENV } = process.env;

    if (NODE_ENV === 'production') {
      cookieOptions.secure = true;
    }

    res.cookie('auth-token', token, cookieOptions);

    return response;
  },

  async logout(root, args, { user, res }) {
    const response = await Users.logout(user);

    res.clearCookie('auth-token');

    return response;
  },

  /*
   * Send forgot password email
   * @param {String} email - Email to send link
   * @return {String} - Recover link
   */
  async forgotPassword(root, { email }) {
    const token = await Users.forgotPassword(email);

    // send email ==============
    const { MAIN_APP_DOMAIN } = process.env;

    const link = `${MAIN_APP_DOMAIN}/reset-password?token=${token}`;

    utils.sendEmail({
      toEmails: [email],
      subject: 'Reset password',
      template: {
        name: 'resetPassword',
        data: {
          content: link,
        },
      },
    });

    return link;
  },

  /*
   * Reset password
   * @param {String} token - Temporary token to find user
   * @param {String} newPassword - New password to set
   * @return {Promise} - Updated user object
   */
  async resetPassword(root, args) {
    const user = await Users.resetPassword(args);

    // if user is not registered via buyer then create company for new user
    if (user.isSupplier && !user.companyId) {
      await Companies.createCompany(user._id);
    }

    return user;
  },

  /*
   * Change user password
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password to set
   * @return {Promise} - Updated user object
   */
  usersChangePassword(root, args, { user }) {
    return Users.changePassword({ _id: user._id, ...args });
  },

  /*
   * Create new user
   * @param {Object} args - User doc
   * @return {Promise} - Newly created user
   */
  async usersAdd(root, args, { user }) {
    const { password, passwordConfirmation } = args;

    if (password !== passwordConfirmation) {
      throw new Error('Incorrect password confirmation');
    }

    const newUser = await Users.createUser(args);

    if (newUser) {
      await putCreateLog(
        {
          type: LOG_TYPES.USER,
          newData: JSON.stringify(args),
          description: `"${newUser.username}" has been added`,
          object: newUser,
        },
        user,
      );
    }

    return newUser;
  },

  /**
   * Updates a user
   * @param {Object} args - User doc
   * @returns {Promise} - Updated user
   */
  async usersEdit(root, args, { user }) {
    const { _id, password, passwordConfirmation } = args;

    if (password && password !== passwordConfirmation) {
      throw new Error('Incorrect password confirmation');
    }

    delete args._id;
    delete args.passwordConfirmation;

    const oldUser = await Users.findOne({ _id });
    const updatedUser = await Users.updateUser(_id, args);

    if (updatedUser) {
      await putUpdateLog(
        {
          type: LOG_TYPES.USER,
          object: oldUser,
          newData: JSON.stringify(args),
          description: `"${updatedUser.username}" has been edited`,
        },
        user,
      );
    }

    return updatedUser;
  },

  /*
   * Edit user profile
   * @param {Object} args - User profile doc
   * @return {Promise} - Updated user
   */
  async usersEditProfile(root, args, { user }) {
    const { password } = args;

    const userOnDb = await Users.findOne({ _id: user._id });
    const valid = await Users.comparePassword(password, userOnDb.password);

    if (!password || !valid) {
      // bad password
      throw new Error('Invalid password');
    }

    const updatedUser = await Users.editProfile(user._id, args);

    if (updatedUser.temporarySecureInformation) {
      const { MAIN_APP_DOMAIN } = process.env;
      const link = `${MAIN_APP_DOMAIN}/confirm-profile-edition?token=${
        updatedUser.temporarySecureInformation.token
      }`;

      utils.sendEmail({
        toEmails: [userOnDb.email],
        subject: 'Confirm profile edition',
        template: {
          name: 'profileEditConfirmation',
          data: {
            content: link,
          },
        },
      });
    }

    return updatedUser;
  },

  /*
   * Give someone your account temporarily
   * @param {String} userId - The user that will have extra account
   * @param {String} startDate - Start date of delegate action
   * @param {String} endDate - End date of delegate action
   * @return {User} - Extra account received user
   */
  async usersDelegate(root, { userId, startDate, endDate, reason }, { user }) {
    const receivedUser = await Users.delegate({
      userId: user._id,
      delegateUserId: userId,
      startDate,
      endDate,
    });

    const { MAIN_APP_DOMAIN } = process.env;

    utils.sendEmail({
      toEmails: [receivedUser.email],
      subject: 'Delegation',
      template: {
        name: 'delegation',
        data: {
          reason: reason,
          user,
          receivedUser,
          MAIN_APP_DOMAIN,
        },
      },
    });

    return receivedUser;
  },

  /**
   * Removes a user
   * @param {string} _id - User _id
   * @returns {Promise} - Remove user response
   */
  async usersRemove(root, { _id }, { user }) {
    const found = await Users.findOne({ _id });
    const removed = await Users.removeUser(_id);

    if (found && removed) {
      await putDeleteLog(
        {
          type: LOG_TYPES.USER,
          object: found,
          description: `"${found.username}" has been removed`,
        },
        user,
      );
    }

    return removed;
  },
};

requireBuyer(userMutations, 'registerViaBuyer');
requireBuyer(userMutations, 'usersAdd');
requireBuyer(userMutations, 'usersEdit');
requireBuyer(userMutations, 'usersRemove');
requireBuyer(userMutations, 'usersDelegate');

requireLogin(userMutations, 'logout');
requireLogin(userMutations, 'confirmProfileEdit');
requireLogin(userMutations, 'usersChangePassword');
requireLogin(userMutations, 'usersEditProfile');

requireLogout(userMutations, 'register');
requireLogout(userMutations, 'resendConfirmationLink');
requireLogout(userMutations, 'confirmRegistration');
requireLogout(userMutations, 'forgotPassword');
requireLogout(userMutations, 'resetPassword');

export default userMutations;
