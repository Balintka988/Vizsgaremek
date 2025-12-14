import { Router } from "express";
import { healthCheck } from "../controllers/healthController";
import authRoutes from "./authRoutes";
import carRoutes from "./carRoutes";

const router = Router();

router.get("/health", healthCheck);
router.use("/auth", authRoutes);
router.use("/cars", carRoutes);

export default router;