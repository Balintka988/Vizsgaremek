import { db } from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config";

export class AuthService {
  static async register(name: string, email: string, password: string, phone: string) {
    const password_hash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password_hash, phone, role)
      VALUES (?, ?, ?, ?, 'user')
    `;

    const result = await db.execute(sql, [name, email, password_hash, phone]);
    return result;
  }

  static async login(email: string, password: string) {
    const [rows]: any = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      throw new Error("Nincs ilyen felhasználó");
    }

    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new Error("Rossz jelszó");

    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: "2h" }
    );

    return { token, user };
  }
}
