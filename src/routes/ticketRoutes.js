import { Router } from "express";
import { createTicket, getMyTickets } from "../controllers/ticketController.js";

const router = Router();

router.post("/", createTicket);
router.get("/my", getMyTickets);

export default router;
