import { Users } from '../../db/models';

export default {
  createdUser(dueDiligence) {
    return Users.findOne({ _id: dueDiligence.createdUserId });
  },
};
