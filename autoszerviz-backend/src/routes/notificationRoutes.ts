import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { getNotifications, markAsRead, sendNotification, deleteNotification } from "../controllers/notificationController";

const router = Router();

router.get("/", verifyToken, getNotifications);
router.put("/:id/read", verifyToken, markAsRead);
router.delete("/:id", verifyToken, deleteNotification);
router.post("/", verifyToken, sendNotification);

export default router;
