import { moduleRequireAdmin } from '../../permissions';
import { PERMISSIONS } from '../../constants';

const permissionQueries = {
  /**
   * constructs a permission list with an item defined
   * as Object with permission name and module name and returns it
   * @return {Object[]} return a list of permissions
   */
  permissions() {
    const result = [];

    for (let module of Object.keys(PERMISSIONS)) {
      for (let name of PERMISSIONS[module]) {
        result.push({
          module,
          name: name,
        });
      }
    }

    return result;
  },

  /**
   * Constructs an object with modules as its items
   * containing a list of permissions and returns it
   * @return {Object[]} return a list of permissions
   */
  modulePermissions() {
    const result = [];

    for (let moduleName of Object.keys(PERMISSIONS)) {
      result.push({
        name: moduleName,
        permissions: PERMISSIONS[moduleName],
      });
    }

    return result;
  },
};

moduleRequireAdmin(permissionQueries);

export default permissionQueries;
