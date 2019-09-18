import dotenv from 'dotenv';

import { trackSes } from './trackers/sesTracker';

dotenv.config();

export const init = async app => {
  trackSes(app);
};
