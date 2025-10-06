import express from "express";
import multer from "multer";
import { createStory, getStories,deleteStory } from "../controllers/story.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("img"), createStory);
router.get("/", getStories);
router.delete("/:id", deleteStory);

export default router;