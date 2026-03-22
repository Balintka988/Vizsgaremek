function parseYmdHm(dateTime: string): Date | null {
  const raw = String(dateTime ?? "").trim();
  if (!raw) return null;

  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]) - 1;
    const day = Number(m[3]);
    const hour = Number(m[4]);
    const minute = Number(m[5]);
    const second = Number(m[6] ?? 0);
    return new Date(year, month, day, hour, minute, second);
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export const formatBookingHu = (dateTime: any) => {
  const dt = parseYmdHm(String(dateTime ?? ""));
  if (!dt) return String(dateTime ?? "");
  return dt.toLocaleString("hu-HU");
};
function parseYmdHmAsUtc(dateTime: string): Date | null {
  const raw = String(dateTime ?? "").trim();
  if (!raw) return null;
  if (/[zZ]$/.test(raw) || /[+-]\d{2}:?\d{2}$/.test(raw)) {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]) - 1;
    const day = Number(m[3]);
    const hour = Number(m[4]);
    const minute = Number(m[5]);
    const second = Number(m[6] ?? 0);
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }
  const parsed = new Date(raw + "Z");
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export const formatNotificationHu = (dateTime: any) => {
  const dt = parseYmdHmAsUtc(String(dateTime ?? ""));
  if (!dt) return String(dateTime ?? "");
  return dt.toLocaleString("hu-HU");
};
