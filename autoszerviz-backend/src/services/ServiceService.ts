import { db } from "../config/db";

export class ServiceService {

  static async listServices() {
    const [rows] = await db.execute("SELECT * FROM services ORDER BY id ASC");
    return rows;
  }
}

export default ServiceService;