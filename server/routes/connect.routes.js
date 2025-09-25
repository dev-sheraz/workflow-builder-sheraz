// Import Express router and connect controller
import express from "express";
import { generateConnectToken } from "../controllers/connect.controller.js";

// Create Express router instance for connect-related routes
const router = express.Router();

/**
 * POST /generate-connect-token
 * Generates a Pipedream Connect token for user authentication
 * Used by frontend to authenticate with Pipedream services
 */
router.post("/generate-connect-token", generateConnectToken);

export default router;
