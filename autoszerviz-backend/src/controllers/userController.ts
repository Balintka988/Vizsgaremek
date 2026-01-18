import { Request, Response } from "express";
import { UserService } from "../services/UserService";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const profile = await UserService.getProfile(userId);
    return res.json(profile);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Profil lekérése sikertelen" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email, phone } = req.body;
    const updated = await UserService.updateProfile(userId, { name, email, phone });
    return res.json(updated);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Profil frissítése sikertelen" });
  }
};