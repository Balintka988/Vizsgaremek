import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { createBooking, getBookings, getAvailability, cancelBooking, updateBooking } from "../controllers/bookingController";

const router = Router();

router.get("/availability", getAvailability);
router.get("/", verifyToken, getBookings);
router.post("/", verifyToken, createBooking);
router.delete("/:id", verifyToken, cancelBooking);
router.put("/:id", verifyToken, updateBooking);

export default router;
