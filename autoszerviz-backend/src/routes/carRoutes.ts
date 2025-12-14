import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import {
  getCars,
  addCar,
  updateCar,
  deleteCar
} from "../controllers/carController";

const router = Router();

router.get("/", verifyToken, getCars);
router.post("/", verifyToken, addCar);
router.put("/:id", verifyToken, updateCar);
router.delete("/:id", verifyToken, deleteCar);

export default router;
