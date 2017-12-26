import { Users, Companies } from '../../../db/models';
import utils from '../../../data/utils';
import { requireLogin, requireAdmin } from '../../permissions';

const userMutations = {
  /*
   * Register
   * @param {String} email - User email
   * @param {String} password - User password
   * @return - Newly created user object
   */
  async register(root, args) {
    const { password, passwordConfirmation, email } = args;

    if (password !== passwordConfirmation) {
      throw new Error('Incorrect password confirmation');
    }

    const user = await Users.register({ email, password });

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
    const { COMPANY_EMAIL_FROM, MAIN_APP_DOMAIN } = process.env;

    const link = `${MAIN_APP_DOMAIN}/reset-password?token=${token}`;

    utils.sendEmail({
      toEmails: [email],
      fromEmail: COMPANY_EMAIL_FROM,
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
    const { username, password, passwordConfirmation, email, role, details } = args;

    if (password !== passwordConfirmation) {
      throw new Error('Incorrect password confirmation');
    }

    return Users.createUser({ username, password, email, role, details });
  },

  /*
   * Update user
   * @param {Object} args - User doc
   * @return {Promise} - Updated user
   */
  async usersEdit(root, args) {
    const { _id, username, password, passwordConfirmation, email, role, details } = args;

    if (password && password !== passwordConfirmation) {
      throw new Error('Incorrect password confirmation');
    }

    return Users.updateUser(_id, { username, password, email, role, details });
  },

  /*
   * Edit user profile
   * @param {Object} args - User profile doc
   * @return {Promise} - Updated user
   */
  async usersEditProfile(root, { username, email, password, details }, { user }) {
    const userOnDb = await Users.findOne({ _id: user._id });
    const valid = await Users.comparePassword(password, userOnDb.password);

    if (!password || !valid) {
      // bad password
      throw new Error('Invalid password');
    }

    return Users.editProfile(user._id, { username, email, details });
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

requireAdmin(userMutations, 'usersAdd');
requireAdmin(userMutations, 'usersEdit');
requireLogin(userMutations, 'usersChangePassword');
requireLogin(userMutations, 'usersEditProfile');
requireAdmin(userMutations, 'usersRemove');

export default userMutations;