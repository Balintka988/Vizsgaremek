import { db } from "../config/db";

export class CarService {
  static async listByUser(userId: number) {
    const [rows] = await db.execute("SELECT * FROM cars WHERE owner_id = ?", [userId]);
    return rows;
  }

  static async listAllCars() {
    const [rows] = await db.execute(
      `SELECT cars.*, users.name AS user_name, users.phone AS user_phone
       FROM cars
       JOIN users ON cars.owner_id = users.id
       ORDER BY cars.id DESC`
    );
    return rows;
  }

  static async getCarById(carId: number, userId: number) {
    const [rows]: any = await db.execute(
      "SELECT * FROM cars WHERE id = ? AND owner_id = ?",
      [carId, userId]
    );

    return rows[0] || null;
  }

  static async getCarByPlateForUser(licensePlate: string, userId: number) {
    const plate = String(licensePlate ?? "").trim();
    const [rows]: any = await db.execute(
      "SELECT * FROM cars WHERE license_plate = ? AND owner_id = ? LIMIT 1",
      [plate, userId]
    );
    return rows[0] || null;
  }

  static async getCarByPlateAdmin(licensePlate: string) {
    const plate = String(licensePlate ?? "").trim();
    const [rows]: any = await db.execute(
      "SELECT cars.*, users.name AS user_name, users.phone AS user_phone FROM cars JOIN users ON cars.owner_id = users.id WHERE cars.license_plate = ? LIMIT 1",
      [plate]
    );
    return rows[0] || null;
  }

  static async addCar(userId: number, data: any) {
    const brandGroup = String(data?.brand_group ?? "atlagos").trim() || "atlagos";
    const sql = `
      INSERT INTO cars (owner_id, license_plate, type, brand_group, status)
      VALUES (?, ?, ?, ?, ?)`;
    const values = [userId, data.license_plate, data.type, brandGroup, "Nincs státusz"];
    return db.execute(sql, values);
  }

  static async updateCar(id: number, data: any) {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.license_plate !== undefined) {
      fields.push("license_plate = ?");
      values.push(data.license_plate);
    }

    if (data.type !== undefined) {
      fields.push("type = ?");
      values.push(data.type);
    }

    if (data.brand_group !== undefined) {
      fields.push("brand_group = ?");
      values.push(String(data.brand_group || "atlagos"));
    }

    if (fields.length === 0) {
      throw new Error("Nincs frissíthető mező");
    }

    const sql = `UPDATE cars SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);
    const result = await db.execute(sql, values);

    return result;
  }

  static async deleteCar(id: number) {
    return db.execute("DELETE FROM cars WHERE id = ?", [id]);
  }
}
