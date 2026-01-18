import { db } from "../config/db";

export class UserService {
  static async getProfile(userId: number) {
    const sql = `SELECT id, name, email, phone, role FROM users WHERE id = ?`;
    const [rows]: any = await db.execute(sql, [userId]);
    if (!rows || rows.length === 0) throw new Error("Felhasználó nem található");
    return rows[0];
  }

  static async updateProfile(userId: number, data: any) {
    const fields = [];
    const values: any[] = [];
    if (data.name) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.email) {
      fields.push("email = ?");
      values.push(data.email);
    }
    if (data.phone) {
      fields.push("phone = ?");
      values.push(data.phone);
    }
    if (fields.length === 0) {
      return this.getProfile(userId);
    }
    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    values.push(userId);
    await db.execute(sql, values);
    return this.getProfile(userId);
  }
}
