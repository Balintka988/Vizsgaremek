import { Router } from "express";
import { getServices } from "../controllers/serviceController";

const router = Router();

router.get("/", getServices);

export default router;