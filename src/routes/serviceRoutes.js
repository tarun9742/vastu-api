import { Router } from "express";
import { getServices } from "../controllers/serviceController.js";

const router = Router();

// Public endpoint to get active services
router.get("/", getServices);

export default router;
