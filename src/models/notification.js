import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["friend_request", "message", "like", "comment"],
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }, // who triggered
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  }, // for like/comment
  message: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;