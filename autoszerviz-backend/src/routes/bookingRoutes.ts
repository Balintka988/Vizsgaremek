import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { createBooking, getBookings, getAvailability, cancelBooking } from "../controllers/bookingController";

const router = Router();

router.get("/availability", getAvailability);
router.get("/", verifyToken, getBookings);
router.post("/", verifyToken, createBooking);
router.delete("/:id", verifyToken, cancelBooking);
export default router;
