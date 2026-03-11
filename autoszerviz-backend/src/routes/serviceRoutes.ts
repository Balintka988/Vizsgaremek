import { Router } from "express";
import { getServices, createService, updateService, deleteService } from "../controllers/serviceController";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getServices);
router.post("/", verifyToken, requireAdmin, createService);
router.put("/:id", verifyToken, requireAdmin, updateService);
router.delete("/:id", verifyToken, requireAdmin, deleteService);

export default router;