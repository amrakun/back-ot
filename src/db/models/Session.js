import mongoose from 'mongoose';
import { field } from './utils';

const SessionSchema = mongoose.Schema({
  createdAt: { type: Date, default: Date.now, expires: '1d' },
  invalidToken: field({ type: String }),
});

const Session = mongoose.model('session', SessionSchema);

export default Session;
