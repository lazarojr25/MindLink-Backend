import express from "express";

const router = express.Router();

import availabilityController from "../controllers/availabilityController.js";

router.route("/availability").get((req, res) => availabilityController.getAllAvailabilitys(req, res));

router.route("/availability").post((req, res) => availabilityController.createAvailability(req, res));

router
  .route("/availability/:id")
  .get((req, res) => availabilityController.getAvailabilitysByUserId(req, res));

export default router;