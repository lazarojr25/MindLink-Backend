import express from "express";
import messageController from "../controllers/messageController.js";

const router = express.Router();

router.route("/messages").get((req,res) => messageController.getAllMessages(res,res));
router.route("/messages/:userId").get((req,res) => messageController.getMessagesByUserId(req,res));

export default router;
