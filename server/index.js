// Import required dependencies
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Import route handlers
import connectRoutes from "./routes/connect.routes.js"
import workflowRoutes from "./routes/workflows.routes.js"
import accountRoutes from "./routes/account.routes.js"
import deploymentsRoutes from "./routes/deployments.routes.js"

// Import cron job manager
import { initializeCronJobs } from "./utils/cronManager.js";

// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();

// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Register route handlers
app.use("/", connectRoutes);
app.use("/api", workflowRoutes);
app.use("/api", accountRoutes);
app.use("/api/deployments", deploymentsRoutes);

// Start server on port 4000
app.listen(4000, () => {
  console.log("Server running at http://localhost:4000");

  // Initialize cron jobs for active deployments
  console.log("Initializing cron jobs for active deployments...");
  const jobCount = initializeCronJobs();
  console.log(`Server ready with ${jobCount} active workflow deployments`);
});
