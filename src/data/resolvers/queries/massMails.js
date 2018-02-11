import { MassMails } from '../../../db/models';
import { moduleRequireBuyer } from '../../permissions';

const massMailQueries = {
  /**
   * MassEmails list
   */
  massMails() {
    return MassMails.find({});
  },
};

moduleRequireBuyer(massMailQueries);

export default massMailQueries;
