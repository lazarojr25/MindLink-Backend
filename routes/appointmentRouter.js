import express from "express";

const router = express.Router();

import appointmentController from "../controllers/appointmentController.js";

router.route("/appointment").get((req, res) => appointmentController.getAllAppointment(req, res));

router.route("/appointment").post((req, res) => appointmentController.createAppointment(req, res));

router.route("/appointment/:id").get((req, res) => appointmentController.getAppointmentById(req, res));

router.route("/appointments/professional/:professionalId").get((req, res) => appointmentController.getAppointmentsByProfessionalIdInCurrentWeek(req, res));

export default router;