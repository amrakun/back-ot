import { Users } from '../../../db/models';
import { requireLogin } from '../../permissions';
import { paginate } from './utils';

const userQueries = {
  /**
   * Users list
   * @param {Object} args - Search params
   * @return {Promise} sorted and filtered users objects
   */
  users(root, args) {
    const { search } = args;
    const selector = { isSupplier: false };

    if (search) {
      selector.$or = [
        { firstName: new RegExp(`.*${search}.*`, 'i') },
        { lastName: new RegExp(`.*${search}.*`, 'i') },
        { username: new RegExp(`.*${search}.*`, 'i') },
        { email: new RegExp(`.*${search}.*`, 'i') },
      ];
    }

    const users = paginate(Users.find(selector), args);

    return users.sort({ username: 1 });
  },

  /**
   * Get one user
   * @param {Object} args
   * @param {String} args._id
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User making this request
   * @return {Promise} found user
   */
  userDetail(root, { _id }) {
    return Users.findOne({ _id });
  },

  /**
   * Get all users count. We will use it in pager
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User making this request
   * @return {Promise} total count
   */
  usersTotalCount() {
    return Users.find({}).count();
  },

  /**
   * Current user
   * @return {Promise} total count
   */
  currentUser(root, args, { user }) {
    if (user) {
      return Users.findOne({ _id: user._id });
    }

    return null;
  },
};

requireLogin(userQueries, 'users');
requireLogin(userQueries, 'userDetail');
requireLogin(userQueries, 'usersTotalCount');

export default userQueries;
