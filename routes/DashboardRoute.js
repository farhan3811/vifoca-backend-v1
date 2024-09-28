import express from "express";
import {
    getDashboardData
} from "../controllers/Dashboard.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();
router.get('/dashboard', verifyUser, getDashboardData);

export default router;