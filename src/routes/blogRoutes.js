import { Router } from "express";
import { getPublicBlogPosts } from "../controllers/blogController.js";

const router = Router();

router.get("/", getPublicBlogPosts);

export default router;
