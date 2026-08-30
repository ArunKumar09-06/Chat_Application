const express = require("express");

const { 
    handleStartConversation
} = require("../controllers/conversation.controller");

const { authenticateUser } = require("../middlewares/auth");

const router = express.Router();

router.post(
    "/with/:userId",
    authenticateUser,
    handleStartConversation
);

module.exports = router;