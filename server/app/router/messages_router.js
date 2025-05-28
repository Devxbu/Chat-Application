const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const {getUserMessages, getConversation, markMessageAsRead, deleteMessage, deleteConversation, sendMessage} = require("../controller/messages_controller");

const auth_token = require("../middleware/auth_token");
const multer = require("multer");
const upload = multer();

// Routes
router.post(
    "/send-message",
    auth_token,
    upload.array("attachments", 10),
    [
        body("receiver").isMongoId(),
        body("message").isString().trim().notEmpty().isLength({ max: 5000 })
    ],
    sendMessage
);
router.get("/get-user-messages", auth_token, getUserMessages);
router.get("/get-conversation/:receiverId", auth_token, getConversation);
router.patch("/mark-message-as-read/:messageId", auth_token, markMessageAsRead);
router.delete("/delete-message/:messageId", auth_token, deleteMessage);
router.delete("/delete-conversation/:receiverId", auth_token, deleteConversation);

module.exports = router;
