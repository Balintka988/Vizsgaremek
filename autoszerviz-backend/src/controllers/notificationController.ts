import type { Request, Response } from "express";
import { NotificationService } from "../services/NotificationService";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ message: "Nincs bejelentkezve" });
    }

    const rows = await NotificationService.listByUser(user.id);
    return res.json(rows);
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Hiba" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ message: "Nincs bejelentkezve" });
    }

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Hibás azonosító" });
    }

    const result = await NotificationService.markAsRead(id);
    return res.json({ message: "Értesítés olvasottnak jelölve", result });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Hiba" });
  }
};

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Nincs jogosultság" });
    }

    const { userIds, type, message } = req.body;
    if (!Array.isArray(userIds) || !message) {
      return res.status(400).json({ message: "Hiányzó userIds vagy message" });
    }

    for (const uid of userIds) {
      const n = Number(uid);
      if (!Number.isFinite(n)) continue;
      await NotificationService.createNotification(n, type || "other", message);
    }

    return res.json({ message: "Értesítések elküldve" });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Hiba" });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ message: "Nincs bejelentkezve" });
    }

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Hibás azonosító" });
    }

    await NotificationService.deleteNotification(id);
    return res.json({ message: "Értesítés törölve" });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Hiba" });
  }
};
