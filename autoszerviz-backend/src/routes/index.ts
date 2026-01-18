import { Router } from "express";
import { healthCheck } from "../controllers/healthController";
import authRoutes from "./authRoutes";
import carRoutes from "./carRoutes";
import serviceRoutes from "./serviceRoutes";
import userRoutes from "./userRoutes";


const router = Router();

router.get("/health", healthCheck);
router.use("/auth", authRoutes);
router.use("/cars", carRoutes);
router.use("/services", serviceRoutes);
router.use("/users", userRoutes);

export default router;