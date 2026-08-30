const express = require("express");

const {
    handleSendMessage,
    handleGetMessages
} = require("../controllers/message.controller");

const {
    authenticareUser,
    authenticateUser,
} = require("../middlewares/auth");

const router = express.Router();

router.post(
    "/",
    authenticateUser,
    handleSendMessage
);

router.get("/:conversationId", authenticateUser, handleGetMessages);

module.exports = router;