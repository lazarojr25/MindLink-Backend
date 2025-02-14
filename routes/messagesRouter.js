import express from "express";
import messageController from "../controllers/messageController.js";

const router = express.Router();


router.route("/messages").post((req, res) => messageController.createMessage(req, res));
router.route("/messages").get((req,res) => messageController.getAllMessages(res,res));
router.route("/messages/:userId").get((req,res) => messageController.getMessagesByUserId(req,res));
router.route("/messages/lastMessage/:userId").get((req,res) => messageController.getLastMessagesByUser(req,res));
router.route("/messages/conversations/:userId").get((req,res) => messageController.getUserConversations(req,res));

export default router;
