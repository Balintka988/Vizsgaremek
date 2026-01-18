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