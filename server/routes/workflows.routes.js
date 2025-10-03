// Import Express router and workflow controllers
import express from "express";
import {
  getWorkflows,
  getWorkflowById,
  runWorkflow,
} from "../controllers/workflows.controller.js";

// Create Express router instance for workflow-related routes
const router = express.Router();

/**
 * POST /api/workflows/run/:id
 * Execute a specific workflow by its ID
 * Requires userId and userAccounts in request body
 */
router.post("/workflows/run/:id", runWorkflow);

/**
 * GET /api/workflows
 * Retrieve all available workflow templates
 * Returns list of workflows from JSON configuration
 */
router.get("/workflows", getWorkflows);

/**
 * GET /api/workflows/:id
 * Retrieve a specific workflow template by ID
 * Returns detailed workflow configuration
 */
router.get("/workflows/:id", getWorkflowById);

export default router;
