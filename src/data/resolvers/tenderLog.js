import { Users, Tenders } from '../../db/models';

export default {
  tender({ tenderId }) {
    return Tenders.findOne({ _id: tenderId });
  },

  user({ userId }) {
    return Users.findOne({ _id: userId });
  },
};
