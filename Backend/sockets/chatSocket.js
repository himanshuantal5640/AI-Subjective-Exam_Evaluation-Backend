const Message = require("../models/Message");
const socketAuth = require("../middleware/socketAuth");

const onlineUsers = new Map();

module.exports = (io) => {

  // Use auth middleware
  io.use(socketAuth);

  io.on("connection", (socket) => {

    const userId = socket.user.id;

    console.log("🔌 Connected:", userId);

    // Store online user
    onlineUsers.set(userId, socket.id);

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    socket.join(userId);

    // SEND MESSAGE
    socket.on("sendMessage", async (data) => {

      const { receiver, message } = data;

      const newMessage = await Message.create({
        sender: userId,
        receiver,
        message
      });

      io.to(receiver).emit("receiveMessage", newMessage);
      io.to(userId).emit("receiveMessage", newMessage);
    });

    // TYPING
    socket.on("typing", ({ receiver }) => {
      io.to(receiver).emit("typing", {
        sender: userId
      });
    });

    socket.on("stopTyping", ({ receiver }) => {
      io.to(receiver).emit("stopTyping", {
        sender: userId
      });
    });

    // MESSAGE SEEN
    socket.on("messageSeen", async ({ messageId }) => {

      await Message.findByIdAndUpdate(
        messageId,
        { isSeen: true }
      );

      const message =
        await Message.findById(messageId);

      io.to(message.sender.toString())
        .emit("messageSeen", { messageId });
    });

    socket.on("disconnect", () => {

      onlineUsers.delete(userId);

      io.emit("onlineUsers",
        Array.from(onlineUsers.keys())
      );

      console.log("Disconnected:", userId);
    });

  });

};
