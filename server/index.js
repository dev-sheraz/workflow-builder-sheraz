import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectRoutes from "./routes/connect.routes.js"
import workflowRoutes from "./routes/workflows.routes.js"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/", connectRoutes);
app.use("/", workflowRoutes);

app.listen(4000, () => {
  console.log("Server running at http://localhost:4000");
});
