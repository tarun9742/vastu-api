import { Router } from "express";
import {
  initiateAppointmentPayment,
  bookAppointment,
  getMyConsultations,
} from "../controllers/consultationController.js";

const router = Router();

router.post("/", bookAppointment);
router.post("/initiate-payu", initiateAppointmentPayment);
router.get("/my", getMyConsultations);

export default router;
