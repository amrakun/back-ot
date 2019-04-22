import dotenv from 'dotenv';
// import './cronJobs/companies';
import './cronJobs/audits';
import './cronJobs/tenders';
import './cronJobs/feedbacks';
import './cronJobs/blockedCompanies';

import { trackSes } from './trackers/sesTracker';

dotenv.config();

export const init = async app => {
  trackSes(app);
};
