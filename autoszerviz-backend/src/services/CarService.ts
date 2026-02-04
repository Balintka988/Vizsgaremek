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

  static async addCar(userId: number, data: any) {
    const sql = `
      INSERT INTO cars (owner_id, license_plate, type, status)
      VALUES (?, ?, ?, ?)
    `;
    const values = [userId, data.license_plate, data.type, "Nincs státusz"];
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

    let normalizedStatus: string | null = null;
    if (data.status !== undefined) {
      normalizedStatus = data.status === "" ? "Nincs státusz" : String(data.status);
      fields.push("status = ?");
      values.push(normalizedStatus);
    }

    if (fields.length === 0) {
      throw new Error("Nincs frissíthető mező");
    }

    const sql = `UPDATE cars SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);
    const result = await db.execute(sql, values);

    if (normalizedStatus !== null) {
      await db.execute(
        "UPDATE bookings SET status = ? WHERE car_id = ? AND status != 'Kész'",
        [normalizedStatus, id]
      );
    }

    return result;
  }

  static async deleteCar(id: number) {
    return db.execute("DELETE FROM cars WHERE id = ?", [id]);
  }
}
