import mongoose, { Schema } from 'mongoose';

var ObjectId = mongoose.Schema.Types.ObjectId;

const MessageSchema = new Schema(
  {
    tenderId: ObjectId,
    sender: ObjectId,
    recipient: ObjectId,
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
