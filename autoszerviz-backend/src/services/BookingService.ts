import { db } from "../config/db";
import { NotificationService } from "./NotificationService";
import { sendToUser } from "../app/websocket";

export class BookingService {
  static async syncCarStatus(carId: number) {
    const latest = await BookingService.getLatestStatusByCarId(carId);
    const nextStatus = latest ? String(latest) : "Nincs státusz";
    await db.execute("UPDATE cars SET status = ? WHERE id = ?", [nextStatus, carId]);
  }

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
    const serviceIdsRaw = Array.isArray(data?.service_ids)
      ? data.service_ids
      : Array.isArray(data?.serviceIds)
      ? data.serviceIds
      : data?.service_id
      ? [data.service_id]
      : [];

    const serviceIds = Array.from(
      new Set(
        serviceIdsRaw
          .map((x: any) => Number(x))
          .filter((n: any) => Number.isFinite(n) && n > 0)
      )
    );

    const legacyServiceId = serviceIds.length > 0 ? serviceIds[0] : data.service_id || null;

    const sql = `INSERT INTO bookings (user_id, car_id, date, note, service_id, status)
      VALUES (?, ?, ?, ?, ?, 'Várakozik')`;
    const values = [userId, data.car_id, data.date, data.note || null, legacyServiceId || null];

    const [result]: any = await db.execute(sql, values);
    const bookingId = Number(result?.insertId);

    if (data?.car_id) {
      await db.execute("UPDATE cars SET status = 'Várakozik' WHERE id = ?", [data.car_id]);
    }

    if (bookingId && serviceIds.length > 0) {
      const placeholders = serviceIds.map(() => "(?, ?)").join(", ");
      const insertValues: any[] = [];
      serviceIds.forEach((sid) => {
        insertValues.push(bookingId, sid);
      });
      await db.execute(`INSERT INTO booking_services (booking_id, service_id) VALUES ${placeholders}`, insertValues);
    }

    return result;
  }

  static async listBookings(userId: number) {
    const [rows] = await db.execute(
      `
      SELECT
        b.*,
        DATE(b.date) AS date_key,
        c.license_plate AS license_plate,
        c.type AS car_type,
        c.brand_group AS car_brand_group,
        GROUP_CONCAT(s.name ORDER BY s.id SEPARATOR ', ') AS service_names,
        COALESCE(SUM(s.work_hours), 0) AS service_total_hours,
        (COALESCE(SUM(s.price), 0) * MAX(
          CASE
            WHEN c.brand_group = 'nemet' THEN 1.25
            WHEN c.brand_group = 'olcso' THEN 0.85
            ELSE 1
          END
        )) AS service_total_price
      FROM bookings b
      JOIN cars c ON c.id = b.car_id
      LEFT JOIN booking_services bs ON bs.booking_id = b.id
      LEFT JOIN services s ON s.id = bs.service_id
      WHERE b.user_id = ?
      GROUP BY b.id
      ORDER BY b.date DESC
      `,
      [userId]
    );
    return rows;
  }

  static async listAllBookings() {
    const [rows] = await db.execute(`
      SELECT 
        b.*,
        DATE(b.date) AS date_key,
        u.name AS user_name, 
        u.phone AS user_phone,
        c.license_plate AS license_plate, 
        c.type AS car_type,
        c.brand_group AS car_brand_group,
        GROUP_CONCAT(s.name ORDER BY s.id SEPARATOR '\n') AS service_description,
        GROUP_CONCAT(s.name ORDER BY s.id SEPARATOR ', ') AS service_names,
        COALESCE(SUM(s.work_hours), 0) AS service_total_hours,
        (COALESCE(SUM(s.price), 0) * MAX(
          CASE
            WHEN c.brand_group = 'nemet' THEN 1.25
            WHEN c.brand_group = 'olcso' THEN 0.85
            ELSE 1
          END
        )) AS service_total_price
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN cars c ON b.car_id = c.id
      LEFT JOIN booking_services bs ON bs.booking_id = b.id
      LEFT JOIN services s ON s.id = bs.service_id
      GROUP BY b.id
      ORDER BY b.date DESC
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
    const [prevRows]: any = await db.execute(
      "SELECT b.status, b.user_id, b.car_id, c.license_plate FROM bookings b JOIN cars c ON b.car_id = c.id WHERE b.id = ?",
      [id]
    );
    const prev = prevRows && prevRows.length > 0 ? prevRows[0] : null;
    const prevStatus = String(prev?.status ?? "");

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

    if (data.status && prev?.car_id) {
      await db.execute("UPDATE cars SET status = ? WHERE id = ?", [String(data.status), Number(prev.car_id)]);
    }

    if (data.status && prev && String(data.status) !== prevStatus) {
      const plate = prev?.license_plate ? ` (${prev.license_plate})` : "";
      const msg = `A foglalásod státusza megváltozott${plate}: ${prevStatus || "-"} → ${data.status}`;
      await NotificationService.createNotification(Number(prev.user_id), "status", msg);

      sendToUser(Number(prev.user_id), {
        type: "notification",
        notificationType: "status",
        message: msg,
      });
    }
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
      "SELECT id, user_id, status, car_id FROM bookings WHERE id = ?",
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

    await db.execute("DELETE FROM bookings WHERE id = ?", [id]);

    if (booking.car_id) {
      await BookingService.syncCarStatus(Number(booking.car_id));
    }

    return;
  }
}
