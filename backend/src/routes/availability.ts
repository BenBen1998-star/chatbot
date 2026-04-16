import { Router, Request, Response } from "express";
import { getDb, saveDb } from "../db.js";
import type { AvailableDate } from "../types.js";

const router = Router();

function queryAll(sql: string, params: unknown[] = []): AvailableDate[] {
  const db = getDb();
  const result = db.exec(sql, params);
  if (result.length === 0) return [];
  const cols = result[0].columns;
  return result[0].values.map((vals: any[]) => {
    const row: Record<string, unknown> = {};
    cols.forEach((col: string, i: number) => { row[col] = vals[i]; });
    return row as unknown as AvailableDate;
  });
}

router.get("/", (_req: Request, res: Response) => {
  const dates = queryAll("SELECT * FROM available_dates ORDER BY date ASC");
  res.json(dates);
});

router.post("/", (req: Request<unknown, unknown, { date: string; start_time?: string; end_time?: string; slot_interval?: number }>, res: Response) => {
  try {
    const { date, start_time = "09:00", end_time = "17:00", slot_interval = 30 } = req.body;

    if (!date) {
      res.status(400).json({ error: "date is required" });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: "date must be in YYYY-MM-DD format" });
      return;
    }

    const db = getDb();
    const existing = db.exec("SELECT * FROM available_dates WHERE date = ?", [date]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      res.status(409).json({ error: "Date already exists" });
      return;
    }

    db.run(
      "INSERT INTO available_dates (date, start_time, end_time, slot_interval) VALUES (?, ?, ?, ?)",
      [date, start_time, end_time, slot_interval]
    );
    saveDb();

    const rows = queryAll("SELECT * FROM available_dates WHERE date = ?", [date]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Availability create error:", error);
    res.status(500).json({ error: "Failed to add available date" });
  }
});

router.put("/:id", (req: Request<{ id: string }, unknown, { start_time?: string; end_time?: string; slot_interval?: number }>, res: Response) => {
  try {
    const { id } = req.params;
    const { start_time, end_time, slot_interval } = req.body;

    const existing = queryAll("SELECT * FROM available_dates WHERE id = ?", [Number(id)]);
    if (existing.length === 0) {
      res.status(404).json({ error: "Available date not found" });
      return;
    }

    const db = getDb();
    const current = existing[0];
    db.run(
      "UPDATE available_dates SET start_time = ?, end_time = ?, slot_interval = ? WHERE id = ?",
      [start_time || current.start_time, end_time || current.end_time, slot_interval || current.slot_interval, Number(id)]
    );
    saveDb();

    const updated = queryAll("SELECT * FROM available_dates WHERE id = ?", [Number(id)]);
    res.json(updated[0]);
  } catch (error) {
    console.error("Availability update error:", error);
    res.status(500).json({ error: "Failed to update available date" });
  }
});

router.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const existing = queryAll("SELECT * FROM available_dates WHERE id = ?", [Number(id)]);
    if (existing.length === 0) {
      res.status(404).json({ error: "Available date not found" });
      return;
    }

    const db = getDb();
    db.run("DELETE FROM available_dates WHERE id = ?", [Number(id)]);
    saveDb();

    res.status(204).send();
  } catch (error) {
    console.error("Availability delete error:", error);
    res.status(500).json({ error: "Failed to delete available date" });
  }
});

export default router;
