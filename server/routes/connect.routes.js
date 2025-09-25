import express from "express";
import { generateConnectToken } from "../controllers/connect.controller.js";

const router = express.Router();

router.post("/generate-connect-token", generateConnectToken);

export default router;
