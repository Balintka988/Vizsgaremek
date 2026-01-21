import { Request, Response } from "express";

export const healthCheck = (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Autoszerviz backend működik" });
};
