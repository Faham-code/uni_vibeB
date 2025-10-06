import express from 'express';
import { registerUser, loginUser, getUser, updateUser, deleteUser } from '../controllers/user.js';


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/user/:id", getUser);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);

export default router;