function parseYmdHm(dateTime: string): Date | null {
  const m = String(dateTime).match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})$/);
  if (!m) return null;

  return new Date(`${m[1]}T${m[2]}:00`);
}

export const formatBookingHu = (dateTime: any) => {
  const dt = parseYmdHm(String(dateTime ?? ""));
  if (!dt) return String(dateTime ?? "");
  return dt.toLocaleString("hu-HU");
 };