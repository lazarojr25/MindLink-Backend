import express from "express";

const router = express.Router();

import searchPsychologistsController from "../controllers/searchPsychologistsController.js";

router.route("/searshPyco").get((req, res) => searchPsychologistsController.searchPsychologists(req, res));


export default router;