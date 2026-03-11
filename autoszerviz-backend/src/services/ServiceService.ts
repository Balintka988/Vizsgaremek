import { db } from "../config/db";

export class ServiceService {

  static async listServices() {
    const [rows] = await db.execute("SELECT * FROM services ORDER BY id ASC");
    return rows;
  }

  static async createService(data: any) {
    const name = String(data?.name ?? "").trim();
    const price = Number(String(data?.price ?? "").replace(",", "."));
    const workHours = Number(String(data?.work_hours ?? data?.workHours ?? "").replace(",", "."));

    if (!name) throw new Error("A szolgáltatás neve kötelező");
    if (!Number.isFinite(price) || price < 0) throw new Error("Hibás ár");
    if (!Number.isFinite(workHours) || workHours < 0) throw new Error("Hibás munkaóra");

    const sql = "INSERT INTO services (name, price, work_hours) VALUES (?, ?, ?)";
    return db.execute(sql, [name, price, workHours]);
  }

  static async updateService(id: number, data: any) {
    const fields: string[] = [];
    const values: any[] = [];

    if (data?.name !== undefined) {
      const name = String(data?.name ?? "").trim();
      if (!name) throw new Error("A szolgáltatás neve kötelező");
      fields.push("name = ?");
      values.push(name);
    }

    if (data?.price !== undefined) {
      const price = Number(String(data?.price ?? "").replace(",", "."));
      if (!Number.isFinite(price) || price < 0) throw new Error("Hibás ár");
      fields.push("price = ?");
      values.push(price);
    }

    if (data?.work_hours !== undefined || data?.workHours !== undefined) {
      const workHours = Number(String(data?.work_hours ?? data?.workHours ?? "").replace(",", "."));
      if (!Number.isFinite(workHours) || workHours < 0) throw new Error("Hibás munkaóra");
      fields.push("work_hours = ?");
      values.push(workHours);
    }

    if (fields.length === 0) return;

    values.push(id);
    const sql = `UPDATE services SET ${fields.join(", ")} WHERE id = ?`;
    return db.execute(sql, values);
  }

  static async deleteService(id: number) {
    return db.execute("DELETE FROM services WHERE id = ?", [id]);
  }
}

export default ServiceService;