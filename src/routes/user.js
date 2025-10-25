import express from 'express';
import {
  registerUser,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
  searchUsers,
  getCurrentUser,
  uploadProfilePicture,
  deleteProfilePicture,
} from '../controllers/user.js';


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", getCurrentUser);
router.post("/me/profile-picture", uploadProfilePicture);
router.delete("/me/profile-picture", deleteProfilePicture);

router.get("/user/:id", getUser);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);

router.get("/search", searchUsers);

export default router;