import express from "express";
import usersConnectionController from "../controllers/usersConnectionController.js";

const router = express.Router();



router.route("/usersconnection").get((req, res) => usersConnectionController.getAllUsersConnections(req, res));

router.route("/usersconnection").post((req, res) => usersConnectionController.createUserConnection(req, res));

router
  .route("/usersconnection/:id/:userType")
  .get((req, res) => usersConnectionController.getUsersConnectionsById(req, res));

export default router;
