const mongoose = require("mongoose");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

async function handleSendMessage(req, res) {
  try {
    const { conversationId, text } = req.body;
    if (!conversationId || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Conversation ID and message text are required",
      });
    }

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const isParticipant = await conversation.participants.some(
      (partcipantId) => String(partcipantId) === String(req.user.id),
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not allowed to send messages in this conversations",
      });
    }

    const sentMessage = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text: text.trim(),
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    await sentMessage.populate("sender", "name profilePicture");

    return res.status(200).json({
      message: "Message sent successfully",
      sentMessage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to send message",
    });
  }
}

async function handleGetMessages(req, res){
    try{
        const conversationId = req.params.conversationId;

        if(!mongoose.isValidObjectId(conversationId)){
            return res.status(400).json({
                message: "Invalid conversation Id",
            });
        }

        const conversation = await Conversation.findById(
            conversationId
        );

        if(!conversation){
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        const isParticipant = conversation.participants.some(
            (participantId) => String(participantId) === String(req.user.id)
        );

        if(!isParticipant){
            return res.status(403).json({
                message: "You are not allowed to view messages in this conversation",
            });
        }

        const messages = await Message.find({
            conversation: conversationId,
        })
        .populate("sender", "name profilePicture")
        .sort({ createdAt: 1 });

        return res.status(200).json({
            message: "Messages fetched successfully",
            messages
        });
    } catch(error){
        return res.status(500).json({
            message: "Unable to fetch messages",
        });
    }
}

module.exports = {
    handleSendMessage,
    handleGetMessages,
}
