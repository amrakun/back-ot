import { Users, Companies } from '../../../db/models';
import utils from '../../../data/utils';
import { requireLogin, requireBuyer } from '../../permissions';

const register = async email => {
  const user = await Users.register(email);

  // send email ==============
  const { MAIN_APP_DOMAIN } = process.env;

  const link = `${MAIN_APP_DOMAIN}/confirm-registration?token=${user.registrationToken}`;

  utils.sendEmail({
    toEmails: [email],
    title: 'Registration',
    template: {
      name: 'registration',
      data: {
        content: link,
      },
    },
  });

  return { user, link };
};

const userMutations = {
  /*
   * Register
   * @param {String} email - User email
   * @return - Confirmation link
   */
  async register(root, { email }) {
    const { link } = await register(email);

    return link;
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

    // create company for new user
    await Companies.createCompany(user._id);

    return user;
  },

  /*
   * Login
   * @param {String} email - User email
   * @param {String} password - User password
   * @return tokens.token - Token to use authenticate against graphql endpoints
   * @return tokens.refreshToken - Token to use refresh expired token
   */
  login(root, args) {
    return Users.login(args);
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
      title: 'Reset password',
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
  resetPassword(root, args) {
    return Users.resetPassword(args);
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
  async usersAdd(root, args) {
    const { password, passwordConfirmation } = args;

    if (password !== passwordConfirmation) {
      throw new Error('Incorrect password confirmation');
    }

    return Users.createUser(args);
  },

  /*
   * Update user
   * @param {Object} args - User doc
   * @return {Promise} - Updated user
   */
  usersEdit(root, args) {
    const { _id, password, passwordConfirmation } = args;

    if (password && password !== passwordConfirmation) {
      throw new Error('Incorrect password confirmation');
    }

    delete args._id;
    delete args.passwordConfirmation;

    return Users.updateUser(_id, args);
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

    return Users.editProfile(user._id, args);
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
      title: 'Delegation',
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

  /*
   * Remove user
   * @param {String} _id - User _id
   * @return {Promise} - Remove user response
   */
  async usersRemove(root, { _id }) {
    return Users.removeUser(_id);
  },
};

requireBuyer(userMutations, 'registerViaBuyer');
requireBuyer(userMutations, 'usersAdd');
requireBuyer(userMutations, 'usersEdit');
requireLogin(userMutations, 'usersChangePassword');
requireLogin(userMutations, 'usersEditProfile');
requireBuyer(userMutations, 'usersRemove');
requireLogin(userMutations, 'usersDelegate');

export default userMutations;
