import { db } from "../config/db";

export class NotificationService {
  static async listByUser(userId: number) {
    const [rows] = await db.execute(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY date DESC",
      [userId]
    );
    return rows;
  }

  static async markAsRead(id: number) {
    const sql = "UPDATE notifications SET is_read = 1 WHERE id = ?";
    return db.execute(sql, [id]);
  }

  static async createNotification(
    userId: number,
    type: string,
    message: string
  ) {
    const notifType = type || "other";
    const sql =
      "INSERT INTO notifications (user_id, type, message, date, is_read) VALUES (?, ?, ?, UTC_TIMESTAMP(), 0)";
    return db.execute(sql, [userId, notifType, message]);
  }

  static async deleteNotification(id: number) {
    return db.execute("DELETE FROM notifications WHERE id = ?", [id]);
  }
}
