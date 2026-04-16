import { getDb, saveDb } from "../db.js";
import type { Appointment } from "../types.js";

function getDateConfig(date: string): { start: number; end: number; interval: number } {
  const db = getDb();
  const result = db.exec(
    "SELECT start_time, end_time, slot_interval FROM available_dates WHERE date = ?",
    [date]
  );
  if (result.length === 0 || result[0].values.length === 0) {
    return { start: 9, end: 17, interval: 30 };
  }
  const [startTime, endTime, interval] = result[0].values[0] as [string, string, number];
  return {
    start: parseInt(startTime.split(":")[0]),
    end: parseInt(endTime.split(":")[0]),
    interval: interval,
  };
}

export function generateAllSlots(date?: string): string[] {
  const config = date ? getDateConfig(date) : { start: 9, end: 17, interval: 30 };
  const slots: string[] = [];
  for (let hour = config.start; hour < config.end; hour++) {
    for (let min = 0; min < 60; min += config.interval) {
      slots.push(`${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
    }
  }
  return slots;
}

export function getBookedSlots(date: string): string[] {
  const db = getDb();
  const stmt = db.prepare("SELECT time FROM appointments WHERE date = ?");
  stmt.bind([date]);
  const times: string[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    times.push(row.time as string);
  }
  stmt.free();
  return times;
}

export function getAvailableSlots(date: string): string[] {
  const all = generateAllSlots(date);
  const booked = new Set(getBookedSlots(date));
  return all.filter((slot) => !booked.has(slot));
}

export function isSlotAvailable(date: string, time: string): boolean {
  const db = getDb();
  const result = db.exec("SELECT COUNT(*) as count FROM appointments WHERE date = ? AND time = ?", [date, time]);
  const count = result[0]?.values[0]?.[0] as number;
  return count === 0;
}

export function createAppointment(name: string, date: string, time: string): Appointment {
  const db = getDb();
  db.run("INSERT INTO appointments (name, date, time) VALUES (?, ?, ?)", [name, date, time]);
  saveDb();

  const result = db.exec("SELECT * FROM appointments ORDER BY id DESC LIMIT 1");
  const cols = result[0].columns;
  const vals = result[0].values[0];
  const row: Record<string, unknown> = {};
  cols.forEach((col: string, i: number) => { row[col] = vals[i]; });
  return row as unknown as Appointment;
}

export function getAllAppointments(): Appointment[] {
  const db = getDb();
  const result = db.exec("SELECT * FROM appointments ORDER BY date ASC, time ASC");
  if (result.length === 0) return [];
  const cols = result[0].columns;
  return result[0].values.map((vals: any[]) => {
    const row: Record<string, unknown> = {};
    cols.forEach((col: string, i: number) => { row[col] = vals[i]; });
    return row as unknown as Appointment;
  });
}

export function deleteAppointment(id: number): boolean {
  const db = getDb();
  const existing = db.exec("SELECT * FROM appointments WHERE id = ?", [id]);
  if (existing.length === 0 || existing[0].values.length === 0) return false;
  db.run("DELETE FROM appointments WHERE id = ?", [id]);
  saveDb();
  return true;
}
