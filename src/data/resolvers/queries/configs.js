import { Configs } from '../../../db/models';

const configQueries = {
  /**
   * Get config
   */
  config() {
    return Configs.findOne({});
  },
};

export default configQueries;
