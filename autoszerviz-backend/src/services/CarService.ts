import { db } from "../config/db";

export class CarService {
  static async listByUser(userId: number) {
    const [rows] = await db.execute("SELECT * FROM cars WHERE owner_id = ?", [userId]);
    return rows;
  }

  static async addCar(userId: number, data: any) {
    const sql = `
      INSERT INTO cars (owner_id, license_plate, type, status)
      VALUES (?, ?, ?, ?)
    `;
    const values = [userId, data.license_plate, data.type, "Nincs státusz"];
    return db.execute(sql, values);
  }

  static async updateCar(id: number, data: any) {
    const sql = `
      UPDATE cars
      SET license_plate = ?, type = ?, status = ?
      WHERE id = ?
    `;
    const values = [data.license_plate, data.type, data.status, id];
    return db.execute(sql, values);
  }

  static async deleteCar(id: number) {
    return db.execute("DELETE FROM cars WHERE id = ?", [id]);
  }
}
