import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { getProfile, updateProfile } from "../controllers/userController";

const router = Router();

router.use(verifyToken);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
export default router;