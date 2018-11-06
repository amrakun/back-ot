import { Configs } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';

const configQueries = {
  /**
   * Get config
   */
  config() {
    return Configs.findOne({});
  },
};

moduleRequireBuyer(configQueries);

export default configQueries;
