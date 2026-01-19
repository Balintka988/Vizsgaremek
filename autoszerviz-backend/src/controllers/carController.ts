import { Request, Response } from "express";
import { CarService } from "../services/CarService";

export const getCars = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = user?.id;
    const cars = await CarService.listByUser(userId);

    return res.json(cars);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const getCarById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const carId = Number(req.params.id);

    const car = await CarService.getCarById(carId, userId);

    if (!car) {
      return res.status(404).json({ message: "Nincs ilyen autó" });
    }

    return res.json(car);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const addCar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await CarService.addCar(userId, req.body);
    return res.json({ message: "Autó hozzáadva", result });
  } catch (err: any) {
    console.error("Autó hozzáadás hiba:", err);

    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Már létezik ilyen rendszámú autó!" });
    }

    return res.status(400).json({
      message: err?.message || "Ismeretlen hiba történt az autó mentésekor.",
    });
  }
};

export const updateCar = async (req: Request, res: Response) => {
  try {
    const result = await CarService.updateCar(Number(req.params.id), req.body);
    return res.json({ message: "Autó frissítve", result });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const deleteCar = async (req: Request, res: Response) => {
  try {
    const result = await CarService.deleteCar(Number(req.params.id));
    return res.json({ message: "Autó törölve", result });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
