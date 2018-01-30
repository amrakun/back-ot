import { ROLES } from './constants';

/**
 * Wraps object property (function) with permission checkers
 * @param {Object} cls - Object
 * @param {string} methodName - name of the property (method) of the object
 * @param {function[]} checkers - List of permission checkers
 * @return {function} returns wrapped method
 */
const permissionWrapper = (cls, methodName, checker) => {
  const oldMethod = cls[methodName];

  cls[methodName] = (root, args, { user }) => {
    checker(user);

    return oldMethod(root, args, { user });
  };
};

/**
 * Wraps all properties (methods) of a given object with 'Permission required' permission checker
 * @param {Object} cls - Object
 * @param {String} methodName - name of the property (method) of the object
 * @param {Function} checker - loginRequired, adminRequired ...
 */
const moduleWrapper = checker => mdl => {
  for (let method in mdl) {
    checker(mdl, method);
  }
};

/**
 * Require login
 */
export const requireLogin = (cls, methodName) =>
  permissionWrapper(cls, methodName, user => {
    if (!user) {
      throw new Error('Login required');
    }
  });

/**
 * Require admin
 */
export const requireAdmin = (cls, methodName) =>
  permissionWrapper(cls, methodName, user => {
    if (!user) {
      throw new Error('Login required');
    }

    if (user.role !== ROLES.ADMIN) {
      throw new Error('Permission denied');
    }
  });

/**
 * Require supplier
 */
export const requireSupplier = (cls, methodName) =>
  permissionWrapper(cls, methodName, user => {
    if (!user) {
      throw new Error('Login required');
    }

    if (!user.isSupplier) {
      throw new Error('Permission denied');
    }
  });

/**
 * Require buyer
 */
export const requireBuyer = (cls, methodName) =>
  permissionWrapper(cls, methodName, user => {
    if (!user) {
      throw new Error('Login required');
    }

    if (user.isSupplier) {
      throw new Error('Permission denied');
    }

    if (user.role == ROLES.ADMIN) {
      return;
    }

    let found = false;

    for (let permission of user.permissions) {
      if (permission === methodName) {
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error('Current action is forbidden');
    }
  });

export const moduleRequireLogin = moduleWrapper(requireLogin);
export const moduleRequireAdmin = moduleWrapper(requireAdmin);
export const moduleRequireSupplier = moduleWrapper(requireSupplier);
export const moduleRequireBuyer = moduleWrapper(requireBuyer);
