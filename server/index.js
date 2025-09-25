// Import required dependencies
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Import route handlers
import connectRoutes from "./routes/connect.routes.js"
import workflowRoutes from "./routes/workflows.routes.js"

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
app.use("/", workflowRoutes);

// Start server on port 4000
app.listen(4000, () => {
  console.log("Server running at http://localhost:4000");
});
