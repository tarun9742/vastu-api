import { Router } from "express";
import { initiateDonation, getMyDonations } from "../controllers/donationController.js";
import { optionalUser } from "../lib/auth.js";

const router = Router();

router.post("/initiate", initiateDonation);
router.get("/my-donations", optionalUser, getMyDonations);

export default router;
