import express from "express";
import {
  getWorkflows,
  getWorkflowById,
  runWorkflow,
} from "../controllers/workflows.controller.js";

const router = express.Router();

router.post("/api/workflows/run/:id", runWorkflow);
router.get("/api/workflows", getWorkflows);
router.get("/api/workflows/:id", getWorkflowById);

export default router;
