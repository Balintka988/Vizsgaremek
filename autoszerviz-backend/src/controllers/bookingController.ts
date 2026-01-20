import type { Request, Response } from "express";
import { BookingService } from "../services/BookingService";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ message: "Nincs bejelentkezve" });
    }

    const result = await BookingService.createBooking(user.id, req.body);
    return res.json({ message: "Foglalás létrehozva", result });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Hiba" });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ message: "Nincs bejelentkezve" });
    }

    const rows = await BookingService.listBookings(user.id);

    return res.json(rows);
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Hiba" });
  }
};


export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ message: "Nincs bejelentkezve" });
    }

    const bookingId = Number(req.params.id);
    if (!Number.isFinite(bookingId)) {
      return res.status(400).json({ message: "Hibás azonosító" });
    }

    const result = await BookingService.cancelBooking(bookingId, user.id);

    return res.json({ message: "Foglalás törölve", result });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Hiba" });
  }
};

export const getAvailability = async (req: Request, res: Response) => {
  try {
    const from = String(req.query.from ?? "");
    const to = String(req.query.to ?? "");

    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({ message: "Hibás dátum paraméter (from/to)" });
    }

    const rows = await BookingService.listBookingsBetween(from, to);

    const toYmdHm = (raw: any): { ymd: string; hm: string } | null => {
      if (raw == null) return null;

      const s =
        typeof raw === "string"
          ? raw
          : raw instanceof Date
          ? raw.toISOString()
          : new Date(raw).toISOString();

      if (!s) return null;

      if (s.includes("T")) {
        const [ymd, rest] = s.split("T");
        const hm = String(rest ?? "").slice(0, 5);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd) || !/^\d{2}:\d{2}$/.test(hm)) return null;
        return { ymd, hm };
      }

      const parts = s.split(" ");
      const ymd = parts[0] ?? "";
      const hm = String(parts[1] ?? "").slice(0, 5);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd) || !/^\d{2}:\d{2}$/.test(hm)) return null;
      return { ymd, hm };
    };

    const bookedByDate: Record<string, Set<string>> = {};

    for (const b of rows as any[]) {
      const parsed = toYmdHm(b?.date);
      if (!parsed) continue;

      if (!bookedByDate[parsed.ymd]) bookedByDate[parsed.ymd] = new Set();
      bookedByDate[parsed.ymd].add(parsed.hm);
    }

    const generateSlotsForDate = (dateStr: string): string[] => {
      const d = new Date(dateStr + "T00:00:00");
      const dow = d.getDay();

      let slotHours: number[] = [];
      if (dow >= 1 && dow <= 5) slotHours = [8, 9, 10, 11, 12, 13, 14, 15, 16];
      else if (dow === 6) slotHours = [9, 10, 11, 12];

      return slotHours.map((h) => String(h).padStart(2, "0") + ":00");
    };

    const now = new Date();
    const nowDateKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Budapest",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    const nowTimeKey = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Budapest",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);

    const pad2 = (n: number) => String(n).padStart(2, "0");

    const start = new Date(from + "T00:00:00");
    const end = new Date(to + "T00:00:00");

    const out: Array<{ date: string; times: string[] }> = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

      const baseSlots = generateSlotsForDate(dateStr);
      const bookedSet = bookedByDate[dateStr] ?? new Set<string>();

      let available = baseSlots.filter((t) => !bookedSet.has(t));

      if (dateStr < nowDateKey) available = [];
      else if (dateStr === nowDateKey) available = available.filter((t) => t >= nowTimeKey);

      out.push({ date: dateStr, times: available });
    }

    return res.json(out);
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Hiba" });
  }
};
