import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { getProfile, updateProfile, listUsers } from "../controllers/userController";

const router = Router();

router.use(verifyToken);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/", listUsers);

export default router;