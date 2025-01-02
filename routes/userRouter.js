import express from "express";

const router = express.Router();

import userController from "../controllers/userController.js";

router.route("/users").get((req, res) => userController.getAllUsers(req, res));
router.route("/professionalUsers").get((req,res) => userController.getProfessionalUser(req, res));
router.route("/users").post((req, res) => userController.createUser(req, res));

router.route("/users/:id").get((req, res) => userController.getUserById(req, res));

router.route("/users/checkIfIsProfessional/:id").get((req, res) => userController.checkIfUserIsProfessional(req, res));

export default router;
