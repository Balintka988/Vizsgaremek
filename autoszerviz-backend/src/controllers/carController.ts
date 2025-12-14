import { Request, Response } from "express";
import { CarService } from "../services/CarService";

export const getCars = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const cars = await CarService.listByUser(userId);
    res.json(cars);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const addCar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await CarService.addCar(userId, req.body);
    res.json({ message: "Autó hozzáadva", result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCar = async (req: Request, res: Response) => {
  try {
    const result = await CarService.updateCar(Number(req.params.id), req.body);
    res.json({ message: "Autó frissítve", result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCar = async (req: Request, res: Response) => {
  try {
    const result = await CarService.deleteCar(Number(req.params.id));
    res.json({ message: "Autó törölve", result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
