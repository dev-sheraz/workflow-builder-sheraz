import express from "express";
import {
  deployWorkflow,
  listDeployments,
  deleteDeployment,
  updateDeployment,
  getActiveCronJobs,
} from "../controllers/deployments.controller.js";

const router = express.Router();

// Deploy a workflow with polling interval
router.post("/deploy", deployWorkflow);

// List all deployments for a user
router.get("/list/:userId", listDeployments);

// Update a deployment (polling interval or status)
router.put("/update/:deploymentId", updateDeployment);

// Stop and delete a deployment
router.delete("/delete/:deploymentId", deleteDeployment);

// Get all active cron jobs
router.get("/active", getActiveCronJobs);

export default router;
