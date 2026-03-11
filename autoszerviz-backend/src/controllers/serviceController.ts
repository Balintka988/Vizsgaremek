import { Request, Response } from "express";
import ServiceService from "../services/ServiceService";

export const getServices = async (_req: Request, res: Response) => {
  try {
    const services = await ServiceService.listServices();
    return res.json(services);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Hiba a szolgáltatások lekérésekor" });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Nincs jogosultság" });
    }

    const result = await ServiceService.createService(req.body);
    return res.json({ message: "Szolgáltatás létrehozva", result });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Hiba" });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Nincs jogosultság" });
    }

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Hibás azonosító" });
    }

    await ServiceService.updateService(id, req.body);
    return res.json({ message: "Szolgáltatás frissítve" });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Hiba" });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Nincs jogosultság" });
    }

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Hibás azonosító" });
    }

    await ServiceService.deleteService(id);
    return res.json({ message: "Szolgáltatás törölve" });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Hiba" });
  }
};