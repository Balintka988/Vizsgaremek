import { db } from "../config/db";

export class BookingService {
  static async createBooking(userId: number, data: any) {

    const rawDate: string = String(data?.date ?? "").trim();
    const m = rawDate.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/);
    if (!m) {
      throw new Error("Hibás dátum formátum (YYYY-MM-DD HH:MM)");
    }
    const bookingKey = `${m[1]} ${m[2]}`;
    const now = new Date();
    const nowDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Budapest",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    const nowTime = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Budapest",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
    const nowKey = `${nowDate} ${nowTime}`;
    if (bookingKey < nowKey) {
      throw new Error("Múltbeli időpontra nem lehet foglalni");
    }

    const [[{ count }]]: any = await db.execute(
      "SELECT COUNT(*) AS count FROM bookings WHERE car_id = ? AND status != 'Kész'",
      [data.car_id]
    );
    if (count > 0) {
      throw new Error(
        "Ehhez az autóhoz már létezik egy aktív foglalás. Előbb fejezze be vagy törölje a meglévő foglalást."
      );
    }
    const sql = `
      INSERT INTO bookings (user_id, car_id, date, note, service_id, status)
      VALUES (?, ?, ?, ?, ?, 'Várakozik')
    `;
    const values = [
      userId,
      data.car_id,
      data.date,
      data.note || null,
      data.service_id || null,
    ];
    return db.execute(sql, values);
  }

  static async listBookings(userId: number) {
    const [rows] = await db.execute(
      `
      SELECT
        bookings.*,
        DATE(bookings.date) AS date_key
      FROM bookings
      WHERE user_id = ?
      ORDER BY bookings.date DESC
      `,
      [userId]
    );
    return rows;
  }

  static async listAllBookings() {
    const [rows] = await db.execute(`
      SELECT 
        bookings.*,
        DATE(bookings.date) AS date_key,
        users.name AS user_name, 
        users.phone AS user_phone,
        cars.license_plate AS license_plate, 
        cars.type AS car_type,
        services.name AS service_name,
        services.work_hours AS service_work_hours,
        services.price AS service_price
      FROM bookings
      JOIN users ON bookings.user_id = users.id
      JOIN cars ON bookings.car_id = cars.id
      LEFT JOIN services ON bookings.service_id = services.id
      ORDER BY bookings.date DESC
    `);
    return rows;
  }

  static async listBookingsBetween(from: string, to: string) {
    const [rows] = await db.execute(
      `
      SELECT date
      FROM bookings
      WHERE DATE(date) >= ? AND DATE(date) <= ?
      `,
      [from, to]
    );
    return rows;
  }

  static async updateBooking(id: number, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    if (data.status) {
      fields.push("status = ?");
      values.push(data.status);
    }
    if (data.date) {
      fields.push("date = ?");
      values.push(data.date);
    }
    if (data.note) {
      fields.push("note = ?");
      values.push(data.note);
    }
    if (data.hours !== undefined) {
      fields.push("hours = ?");
      values.push(data.hours);
    }
    if (data.cost !== undefined) {
      fields.push("cost = ?");
      values.push(data.cost);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }
    if (data.noteToClient !== undefined) {
      fields.push("note_to_client = ?");
      values.push(data.noteToClient);
    }
    if (fields.length === 0) {
      return;
    }
    const sql = `UPDATE bookings SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);
    await db.execute(sql, values);
  }

  static async getLatestStatusByCarId(carId: number) {
    const [rows]: any = await db.execute(
      "SELECT status FROM bookings WHERE car_id = ? ORDER BY date DESC LIMIT 1",
      [carId]
    );
    return rows.length > 0 ? rows[0].status : null;
  }

  static async cancelBooking(id: number, requester: { id: number; role: string }) {
    const [rows]: any = await db.execute(
      "SELECT id, user_id, status FROM bookings WHERE id = ?",
      [id]
    );
    if (!rows || rows.length === 0) {
      throw new Error("A foglalás nem található");
    }
    const booking = rows[0];
    const status = String(booking.status || "").toLowerCase();
    const isDone = status.includes("kész") || status.includes("befejezve");

    if (requester.role === "admin") {
      if (!isDone) {
        throw new Error("Csak a kész/befejezett foglalások törölhetők");
      }
    } else {
      if (Number(booking.user_id) !== Number(requester.id)) {
        throw new Error("Nincs jogosultság a foglalás törléséhez");
      }
      if (isDone) {
        throw new Error("A kész/befejezett foglalás nem törölhető");
      }
    }

    return db.execute("DELETE FROM bookings WHERE id = ?", [id]);
  }
}
