import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "Token szükséges!" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(403).json({ message: "Token nem megfelelő formátum!" });
  }

  const token = parts[1];
  if (!token) {
    return res.status(403).json({ message: "Token nem megfelelő formátum!" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    (req as any).user = decoded;
    return next();
  } catch (_err) {
    return res.status(401).json({ message: "Érvénytelen token!" });
  }
};
