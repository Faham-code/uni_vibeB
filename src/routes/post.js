import express from "express";
import { createPost, getPosts, getPostById, deletePostById, updatePostById,likePost,unlikePost ,commentOnPost} from "../controllers/post.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";


const upload = multer({ dest: "uploads/" }); // Temporary storage

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const router = express.Router();

router.post("/", upload.single("image"), createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.delete("/:id", deletePostById);
router.put("/:id", upload.single("image"), updatePostById);

router.post("/:id/like", likePost);
router.post("/:id/unlike", unlikePost);
router.post("/:id/comment", commentOnPost);

export default router;