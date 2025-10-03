import express from "express";
import { deleteAppAccountById } from "../controllers/accounts.controller.js";

const router = express.Router();

router.post("/accounts/delete/:id", deleteAppAccountById);

export default router;
