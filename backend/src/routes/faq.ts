import { Router, Request, Response } from "express";
import { getDb, saveDb } from "../db.js";
import type { FaqEntry, CreateFaqRequest } from "../types.js";

const router = Router();

function queryAll(sql: string, params: unknown[] = []): FaqEntry[] {
  const db = getDb();
  const result = db.exec(sql, params);
  if (result.length === 0) return [];
  const cols = result[0].columns;
  return result[0].values.map((vals: any[]) => {
    const row: Record<string, unknown> = {};
    cols.forEach((col: string, i: number) => { row[col] = vals[i]; });
    return row as unknown as FaqEntry;
  });
}

function queryOne(sql: string, params: unknown[] = []): FaqEntry | undefined {
  const rows = queryAll(sql, params);
  return rows[0];
}

router.get("/", (_req: Request, res: Response) => {
  const faqs = queryAll("SELECT * FROM faq ORDER BY id ASC");
  res.json(faqs);
});

router.post("/", (req: Request<unknown, unknown, CreateFaqRequest>, res: Response) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      res.status(400).json({ error: "question and answer are required" });
      return;
    }

    const db = getDb();
    db.run("INSERT INTO faq (question, answer) VALUES (?, ?)", [question, answer]);
    saveDb();

    const faq = queryOne("SELECT * FROM faq ORDER BY id DESC LIMIT 1");
    res.status(201).json(faq);
  } catch (error) {
    console.error("FAQ create error:", error);
    res.status(500).json({ error: "Failed to create FAQ entry" });
  }
});

router.put("/:id", (req: Request<{ id: string }, unknown, CreateFaqRequest>, res: Response) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    if (!question || !answer) {
      res.status(400).json({ error: "question and answer are required" });
      return;
    }

    const existing = queryOne("SELECT * FROM faq WHERE id = ?", [Number(id)]);
    if (!existing) {
      res.status(404).json({ error: "FAQ entry not found" });
      return;
    }

    const db = getDb();
    db.run("UPDATE faq SET question = ?, answer = ? WHERE id = ?", [question, answer, Number(id)]);
    saveDb();

    const faq = queryOne("SELECT * FROM faq WHERE id = ?", [Number(id)]);
    res.json(faq);
  } catch (error) {
    console.error("FAQ update error:", error);
    res.status(500).json({ error: "Failed to update FAQ entry" });
  }
});

router.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const existing = queryOne("SELECT * FROM faq WHERE id = ?", [Number(id)]);
    if (!existing) {
      res.status(404).json({ error: "FAQ entry not found" });
      return;
    }

    const db = getDb();
    db.run("DELETE FROM faq WHERE id = ?", [Number(id)]);
    saveDb();

    res.status(204).send();
  } catch (error) {
    console.error("FAQ delete error:", error);
    res.status(500).json({ error: "Failed to delete FAQ entry" });
  }
});

export default router;
