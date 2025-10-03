/* eslint-disable no-undef */
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { scheduleCronJob, cancelCronJob, getCronJobs } from "../utils/cronManager.js";

/**
 * POST /api/deployments/deploy - Deploy a workflow with polling interval
 *
 * Saves workflow deployment to deployments.json and starts a cron job
 * for active deployments
 *
 * @param {Object} req - Express request object with userId, workflowId, pollingInterval, userAccounts
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with deployment data or error message
 */
export const deployWorkflow = async (req, res) => {
  try {
    const { userId, workflowId, pollingInterval, userAccounts } = req.body;

    // Validate required parameters
    if (!userId || !workflowId || !pollingInterval) {
      return res.status(400).json({
        error: "Missing required parameters",
        message: "userId, workflowId, and pollingInterval are required"
      });
    }

    // Load workflows data to verify workflow exists
    const workflowsPath = path.join(process.cwd(), "data", "workflows.json");
    const workflowsData = JSON.parse(fs.readFileSync(workflowsPath, "utf8"));
    const workflow = workflowsData.find((wf) => wf.template_id === workflowId);

    if (!workflow) {
      return res.status(404).json({
        error: "Workflow not found",
        message: `No workflow found with ID ${workflowId}`,
      });
    }

    // Load existing deployments
    const deploymentsPath = path.join(process.cwd(), "data", "deployments.json");
    let deployments = [];

    try {
      const deploymentsContent = fs.readFileSync(deploymentsPath, "utf8");
      if (deploymentsContent.trim()) {
        deployments = JSON.parse(deploymentsContent);
      }
    } catch (error) {
      // File doesn't exist or is empty, start with empty array
      deployments = [];
    }

    // Check if workflow is already deployed for this user
    const existingDeployment = deployments.find(
      (d) => d.userId === userId && d.workflowId === workflowId && d.status === "active"
    );

    if (existingDeployment) {
      return res.status(400).json({
        error: "Workflow already deployed",
        message: "This workflow is already deployed and active for this user",
        deployment: existingDeployment,
      });
    }

    // Create new deployment
    const deployment = {
      id: uuidv4(),
      userId,
      workflowId,
      workflowName: workflow.payload.settings.name,
      pollingInterval, // in minutes
      userAccounts,
      status: "active",
      createdAt: new Date().toISOString(),
      lastRun: null,
      runCount: 0,
    };

    // Add to deployments array
    deployments.push(deployment);

    // Save to file
    fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));

    // Schedule cron job for this deployment
    scheduleCronJob(deployment);

    console.log(`Workflow ${workflowId} deployed for user ${userId} with ${pollingInterval} minute interval`);

    return res.json({
      success: true,
      message: `Workflow deployed successfully. It will run every ${pollingInterval} minute${pollingInterval !== 1 ? 's' : ''}.`,
      deployment,
    });
  } catch (error) {
    console.error("Error deploying workflow:", error);
    return res.status(500).json({
      error: "Failed to deploy workflow",
      message: error.message,
    });
  }
};

/**
 * GET /api/deployments/list/:userId - List all deployments for a user
 *
 * @param {Object} req - Express request object with userId parameter
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with deployments array
 */
export const listDeployments = async (req, res) => {
  try {
    const { userId } = req.params;

    const deploymentsPath = path.join(process.cwd(), "data", "deployments.json");
    let deployments = [];

    try {
      const deploymentsContent = fs.readFileSync(deploymentsPath, "utf8");
      if (deploymentsContent.trim()) {
        deployments = JSON.parse(deploymentsContent);
      }
    } catch (error) {
      deployments = [];
    }

    // Filter deployments for this user
    const userDeployments = deployments.filter((d) => d.userId === userId);

    return res.json({
      success: true,
      deployments: userDeployments,
    });
  } catch (error) {
    console.error("Error listing deployments:", error);
    return res.status(500).json({
      error: "Failed to list deployments",
      message: error.message,
    });
  }
};

/**
 * DELETE /api/deployments/delete/:deploymentId - Stop and delete a deployment
 *
 * @param {Object} req - Express request object with deploymentId parameter
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status
 */
export const deleteDeployment = async (req, res) => {
  try {
    const { deploymentId } = req.params;

    const deploymentsPath = path.join(process.cwd(), "data", "deployments.json");
    let deployments = [];

    try {
      const deploymentsContent = fs.readFileSync(deploymentsPath, "utf8");
      if (deploymentsContent.trim()) {
        deployments = JSON.parse(deploymentsContent);
      }
    } catch (error) {
      deployments = [];
    }

    // Find deployment
    const deploymentIndex = deployments.findIndex((d) => d.id === deploymentId);

    if (deploymentIndex === -1) {
      return res.status(404).json({
        error: "Deployment not found",
        message: `No deployment found with ID ${deploymentId}`,
      });
    }

    const deployment = deployments[deploymentIndex];

    // Cancel cron job if active
    if (deployment.status === "active") {
      cancelCronJob(deploymentId);
    }

    // Remove deployment from array (actual deletion)
    deployments.splice(deploymentIndex, 1);

    // Save updated deployments
    fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));

    console.log(`Deployment ${deploymentId} deleted permanently`);

    return res.json({
      success: true,
      message: "Deployment deleted successfully",
      deployment,
    });
  } catch (error) {
    console.error("Error deleting deployment:", error);
    return res.status(500).json({
      error: "Failed to delete deployment",
      message: error.message,
    });
  }
};

/**
 * PUT /api/deployments/update/:deploymentId - Update a deployment
 *
 * @param {Object} req - Express request object with deploymentId parameter and update data in body
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated deployment
 */
export const updateDeployment = async (req, res) => {
  try {
    const { deploymentId } = req.params;
    const { pollingInterval, status } = req.body;

    const deploymentsPath = path.join(process.cwd(), "data", "deployments.json");
    let deployments = [];

    try {
      const deploymentsContent = fs.readFileSync(deploymentsPath, "utf8");
      if (deploymentsContent.trim()) {
        deployments = JSON.parse(deploymentsContent);
      }
    } catch (error) {
      deployments = [];
    }

    // Find deployment
    const deploymentIndex = deployments.findIndex((d) => d.id === deploymentId);

    if (deploymentIndex === -1) {
      return res.status(404).json({
        error: "Deployment not found",
        message: `No deployment found with ID ${deploymentId}`,
      });
    }

    const deployment = deployments[deploymentIndex];

    // Update polling interval if provided
    if (pollingInterval !== undefined && pollingInterval > 0) {
      deployment.pollingInterval = pollingInterval;
      deployment.updatedAt = new Date().toISOString();

      // If deployment is active, reschedule the cron job
      if (deployment.status === "active") {
        cancelCronJob(deploymentId);
        scheduleCronJob(deployment);
      }
    }

    // Update status if provided
    if (status !== undefined && (status === "active" || status === "inactive")) {
      const previousStatus = deployment.status;
      deployment.status = status;
      deployment.updatedAt = new Date().toISOString();

      // Handle status change
      if (status === "active" && previousStatus === "inactive") {
        // Reactivate deployment
        scheduleCronJob(deployment);
        console.log(`Deployment ${deploymentId} reactivated`);
      } else if (status === "inactive" && previousStatus === "active") {
        // Deactivate deployment
        cancelCronJob(deploymentId);
        deployment.stoppedAt = new Date().toISOString();
        console.log(`Deployment ${deploymentId} deactivated`);
      }
    }

    // Save updated deployments
    deployments[deploymentIndex] = deployment;
    fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));

    console.log(`Deployment ${deploymentId} updated successfully`);

    return res.json({
      success: true,
      message: "Deployment updated successfully",
      deployment,
    });
  } catch (error) {
    console.error("Error updating deployment:", error);
    return res.status(500).json({
      error: "Failed to update deployment",
      message: error.message,
    });
  }
};

/**
 * GET /api/deployments/active - Get all active cron jobs
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with active cron jobs
 */
export const getActiveCronJobs = async (req, res) => {
  try {
    const cronJobs = getCronJobs();

    return res.json({
      success: true,
      count: cronJobs.length,
      jobs: cronJobs,
    });
  } catch (error) {
    console.error("Error getting active cron jobs:", error);
    return res.status(500).json({
      error: "Failed to get active cron jobs",
      message: error.message,
    });
  }
};
