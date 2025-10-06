import express from "express";
import { sendRequest, acceptRequest } from "../controllers/friendRequest.js";

const router = express.Router();

router.post("/send-request", sendRequest);
router.post("/accept-request", acceptRequest);

export default router;
