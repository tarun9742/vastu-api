import { Router } from "express";
import { signUpload, uploadImage } from "../controllers/uploadController.js";

const router = Router();

router.post("/sign", signUpload);
router.post("/image", uploadImage);

export default router;
