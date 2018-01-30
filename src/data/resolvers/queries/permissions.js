import { moduleRequireBuyer } from '../../permissions';
import { PERMISSIONS } from '../../constants';

const permissionQueries = {
  /**
   * Constructs an object with modules as its items
   * containing a list of permissions and returns it
   * @return {Object[]} return a list of permissions
   */
  modulePermissions() {
    return PERMISSIONS;
  },
};

moduleRequireBuyer(permissionQueries);

export default permissionQueries;
