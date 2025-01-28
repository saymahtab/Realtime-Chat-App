import cloudinary from "../lib/cloudinary.js";
import { getReceiverSockerId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    })
      .sort({ lastMessageTime: -1 })
      .select("-password"); // Corrected

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUser Controller", error.message); // Corrected
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages Controller", error.message); // Corrected
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSockerId = getReceiverSockerId(receiverId);
    if (receiverSockerId) {
      io.to(receiverSockerId).emit("newMessage", newMessage);
    }

    await updateLastMessageTime(senderId);
    await updateLastMessageTime(receiverId);

    const updatedUsers = await User.find({
      _id: { $ne: senderId },
    })
      .sort({ lastMessageTime: -1 })
      .select("-password");

    io.emit("updateUserList", updatedUsers);

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage Controller", error.message); // Corrected
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateLastMessageTime = async (senderId) => {
  await User.findByIdAndUpdate(
    senderId,
    { lastMessageTime: new Date() }, // Update the timestamp
    { new: true } // Return the updated document
  );
};
