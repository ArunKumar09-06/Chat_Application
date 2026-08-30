const Conversation = require("../models/Conversation");
const User = require("../models/User");

async function handleStartConversation(req, res) {
  try {
    const loggedInUserId = req.user.id;
    const otherUserId = req.params.userId;

    if (loggedInUserId === otherUserId) {
      return res.status(400).json({
        message: "You cannot start conversation with yourself",
      });
    }

    const otheruser = await User.findById(otherUserId);

    if (!otheruser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let conversation = await Conversation.findOne({
      participants: {
        $all: [loggedInUserId, otherUserId],
        $size: 2,
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [loggedInUserId, otherUserId],
      });
    }

    return res.status(200).json({
      message: "Conversation is ready",
      conversation,
    });
  } catch (error) {
    console.error("Error Message: ", error);
    return res.status(500).json({
      message: "Unable to start conversation",
    });
  }
}

module.exports = {
  handleStartConversation,
};
