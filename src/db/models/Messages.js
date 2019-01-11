import mongoose, { Schema } from 'mongoose';

const ObjectId = Schema.Types.ObjectId;

const MessageSchema = new Schema(
  {
    tenderId: { type: ObjectId, ref: 'tenders' },
    senderId: { type: ObjectId, ref: 'users' },
    /** @todo check if recipientId field is unnecessary */
    recipientId: { type: ObjectId, ref: 'users' },
    didRead: { type: Boolean, default: false },
    title: String,
    body: Object,
  },
  {
    timestamps: true,
  },
);

class Message {
  async send({ tenderId, from, to, title, body }) {}
}

MessageSchema.loadClass(Message);

const Messages = mongoose.model('messages', MessageSchema);

export default Messages;
