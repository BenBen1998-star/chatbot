import { Router, Request, Response } from "express";
import { getDb, saveDb } from "../db.js";
import type { Setting } from "../types.js";

const router = Router();

function getAllSettings(): Setting[] {
  const db = getDb();
  const result = db.exec("SELECT * FROM settings ORDER BY key ASC");
  if (result.length === 0) return [];
  const cols = result[0].columns;
  return result[0].values.map((vals: any[]) => {
    const row: Record<string, unknown> = {};
    cols.forEach((col: string, i: number) => { row[col] = vals[i]; });
    return row as unknown as Setting;
  });
}

router.get("/", (_req: Request, res: Response) => {
  const settings = getAllSettings();
  const obj: Record<string, string> = {};
  settings.forEach((s) => { obj[s.key] = s.value; });
  res.json(obj);
});

router.put("/:key", (req: Request<{ key: string }, unknown, { value: string }>, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null) {
      res.status(400).json({ error: "value is required" });
      return;
    }

    const db = getDb();
    const existing = db.exec("SELECT * FROM settings WHERE key = ?", [key]);

    if (existing.length === 0 || existing[0].values.length === 0) {
      db.run("INSERT INTO settings (key, value) VALUES (?, ?)", [key, String(value)]);
    } else {
      db.run("UPDATE settings SET value = ? WHERE key = ?", [String(value), key]);
    }
    saveDb();

    res.json({ key, value: String(value) });
  } catch (error) {
    console.error("Settings update error:", error);
    res.status(500).json({ error: "Failed to update setting" });
  }
});

export default router;
