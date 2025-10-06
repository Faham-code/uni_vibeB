import FriendRequest from "../models/friendRequest.js";
import Notification from "../models/notification.js";
import { StreamChat } from "stream-chat";

const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);

export const sendRequest = async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;
    if (!fromUserId || !toUserId) {
      return res.status(400).json({ message: "Both user IDs are required" });
    }
    const existingRequest = await FriendRequest.findOne({ fromUserId, toUserId, status: "pending" });
    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }
    const newRequest = new FriendRequest({ fromUserId, toUserId });
    await newRequest.save();
    await Notification.create({
      user: toUserId, // recipient
      type: "friend_request",
      fromUser: fromUserId,
      message: "You have a new friend request!"
    });
    res.status(201).json({ message: "Friend request sent", request: newRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }
    request.status = "accepted";
    await request.save();

    // Create a chat channel between the two users
    const channel = serverClient.channel('messaging',
      `${request.fromUserId}-${request.toUserId}`,
      { members: [request.fromUserId.toString(), request.toUserId.toString()] }
    );
    await channel.create();

    const token1 = serverClient.createToken(request.fromUserId.toString());
    const token2 = serverClient.createToken(request.toUserId.toString());
    res.status(200).json({ message: "Friend request accepted", request, tokens: { token1, token2 } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};