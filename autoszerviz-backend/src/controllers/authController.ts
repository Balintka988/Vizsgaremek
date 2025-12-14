import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    const result = await AuthService.register(name, email, password, phone);
    res.json({ message: "Sikeres regisztráció", result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
