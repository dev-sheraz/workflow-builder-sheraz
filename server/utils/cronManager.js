/* eslint-disable no-undef */
import cron from "node-cron";
import fs from "fs";
import path from "path";
import { serverClient } from "./pipedream.js";

// Store active cron jobs in memory
const activeCronJobs = new Map();

/**
 * Execute a workflow for a deployment
 *
 * @param {Object} deployment - Deployment object containing workflow and user info
 */
async function executeWorkflow(deployment) {
  try {
    console.log(`Executing workflow ${deployment.workflowId} for user ${deployment.userId}`);

    // Load workflow data to get workflow details
    const workflowsPath = path.join(process.cwd(), "data", "workflows.json");
    const workflowsData = JSON.parse(fs.readFileSync(workflowsPath, "utf8"));
    const workflow = workflowsData.find((wf) => wf.template_id === deployment.workflowId);

    if (!workflow) {
      console.error(`Workflow ${deployment.workflowId} not found`);
      return;
    }

    // Handle custom workflow implementations
    if (deployment.workflowId === "email-to-slack") {
      // Execute custom email-to-slack workflow (import from workflows.controller.js if needed)
      const { mailAttachmentToSlackChannel } = await import("../controllers/workflows.controller.js");
      const result = await mailAttachmentToSlackChannel(
        serverClient,
        deployment.userId,
        deployment.userAccounts
      );

      console.log(`Workflow ${deployment.workflowId} executed. Processed ${result.emailsProcessed} emails`);
    } else {
      // Execute generic Pipedream workflow
      await serverClient.workflows.invokeForExternalUser({
        externalUserId: deployment.userId,
        urlOrEndpoint: workflow.run_url,
      });

      console.log(`Workflow ${deployment.workflowId} executed successfully`);
    }

    // Update deployment with last run time and increment run count
    updateDeploymentLastRun(deployment.id);
  } catch (error) {
    console.error(`Error executing workflow ${deployment.workflowId}:`, error.message);
  }
}

/**
 * Update deployment last run time and run count
 *
 * @param {string} deploymentId - Deployment ID
 */
function updateDeploymentLastRun(deploymentId) {
  try {
    const deploymentsPath = path.join(process.cwd(), "data", "deployments.json");
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));

    const deployment = deployments.find((d) => d.id === deploymentId);
    if (deployment) {
      deployment.lastRun = new Date().toISOString();
      deployment.runCount = (deployment.runCount || 0) + 1;

      fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
    }
  } catch (error) {
    console.error(`Error updating deployment ${deploymentId}:`, error.message);
  }
}

/**
 * Schedule a cron job for a deployment
 *
 * @param {Object} deployment - Deployment object
 * @returns {boolean} Success status
 */
export function scheduleCronJob(deployment) {
  try {
    // Cancel existing job if any
    if (activeCronJobs.has(deployment.id)) {
      cancelCronJob(deployment.id);
    }

    // Convert polling interval (minutes) to cron expression
    const cronExpression = `*/${deployment.pollingInterval} * * * *`;

    // Validate cron expression
    if (!cron.validate(cronExpression)) {
      console.error(`Invalid cron expression: ${cronExpression}`);
      return false;
    }

    // Schedule the cron job
    const task = cron.schedule(cronExpression, () => {
      executeWorkflow(deployment);
    });

    // Store the task
    activeCronJobs.set(deployment.id, {
      task,
      deployment,
      cronExpression,
      createdAt: new Date().toISOString(),
    });

    console.log(`Cron job scheduled for deployment ${deployment.id}: ${cronExpression}`);
    return true;
  } catch (error) {
    console.error(`Error scheduling cron job for deployment ${deployment.id}:`, error.message);
    return false;
  }
}

/**
 * Cancel a cron job for a deployment
 *
 * @param {string} deploymentId - Deployment ID
 * @returns {boolean} Success status
 */
export function cancelCronJob(deploymentId) {
  try {
    const jobInfo = activeCronJobs.get(deploymentId);
    if (jobInfo) {
      jobInfo.task.stop();
      activeCronJobs.delete(deploymentId);
      console.log(`Cron job cancelled for deployment ${deploymentId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error cancelling cron job for deployment ${deploymentId}:`, error.message);
    return false;
  }
}

/**
 * Get all active cron jobs
 *
 * @returns {Array} Array of active cron job info
 */
export function getCronJobs() {
  const jobs = [];
  for (const [deploymentId, jobInfo] of activeCronJobs.entries()) {
    jobs.push({
      deploymentId,
      workflowId: jobInfo.deployment.workflowId,
      workflowName: jobInfo.deployment.workflowName,
      userId: jobInfo.deployment.userId,
      cronExpression: jobInfo.cronExpression,
      pollingInterval: jobInfo.deployment.pollingInterval,
      createdAt: jobInfo.createdAt,
      lastRun: jobInfo.deployment.lastRun,
      runCount: jobInfo.deployment.runCount,
    });
  }
  return jobs;
}

/**
 * Initialize cron jobs for all active deployments on server startup
 *
 * @returns {number} Number of jobs initialized
 */
export function initializeCronJobs() {
  try {
    const deploymentsPath = path.join(process.cwd(), "data", "deployments.json");

    // Check if file exists
    if (!fs.existsSync(deploymentsPath)) {
      console.log("No deployments file found. Creating empty deployments.json");
      fs.writeFileSync(deploymentsPath, JSON.stringify([], null, 2));
      return 0;
    }

    const deploymentsContent = fs.readFileSync(deploymentsPath, "utf8");
    if (!deploymentsContent.trim()) {
      console.log("Deployments file is empty");
      return 0;
    }

    const deployments = JSON.parse(deploymentsContent);

    // Filter active deployments
    const activeDeployments = deployments.filter((d) => d.status === "active");

    console.log(`Found ${activeDeployments.length} active deployments`);

    // Schedule cron job for each active deployment
    let successCount = 0;
    for (const deployment of activeDeployments) {
      if (scheduleCronJob(deployment)) {
        successCount++;
      }
    }

    console.log(`Initialized ${successCount} cron jobs`);
    return successCount;
  } catch (error) {
    console.error("Error initializing cron jobs:", error.message);
    return 0;
  }
}
