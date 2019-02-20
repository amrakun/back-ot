import { Users } from '../../../db/models';
import { requireBuyer } from '../../permissions';
import { paginate } from './utils';

const listFilterSelector = (args) => {
  const { search } = args;
  const selector = { isSupplier: false, isActive: true };

  if (search) {
    selector.$or = [
      { firstName: new RegExp(`.*${search}.*`, 'i') },
      { lastName: new RegExp(`.*${search}.*`, 'i') },
      { username: new RegExp(`.*${search}.*`, 'i') },
      { email: new RegExp(`.*${search}.*`, 'i') },
    ];
  }

  return selector;
}

const userQueries = {
  /**
   * Users list
   * @param {Object} args - Search params
   * @return {Promise} sorted and filtered users objects
   */
  users(root, args) {
    const users = paginate(Users.find(listFilterSelector(args)), args);

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
    return Users.findOne({ _id, isActive: true });
  },

  /**
   * Get all users count. We will use it in pager
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User making this request
   * @return {Promise} total count
   */
  usersTotalCount(root, args) {
    return Users.find(listFilterSelector(args)).count();
  },

  /**
   * Current user
   * @return {Promise} user object
   */
  currentUser(root, args, { user }) {
    if (user) {
      return Users.findOne({ _id: user._id, isActive: true });
    }

    return null;
  },
};

requireBuyer(userQueries, 'users');
requireBuyer(userQueries, 'userDetail');
requireBuyer(userQueries, 'usersTotalCount');

export default userQueries;
