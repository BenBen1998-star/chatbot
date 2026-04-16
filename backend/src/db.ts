import initSqlJs, { type Database } from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dbDir, "database.sqlite");

let db: Database;

export async function initDb(): Promise<Database> {
  const SQL = await initSqlJs();

  // Load existing DB file or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    fs.mkdirSync(dbDir, { recursive: true });
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS faq (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS available_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      start_time TEXT NOT NULL DEFAULT '09:00',
      end_time TEXT NOT NULL DEFAULT '17:00',
      slot_interval INTEGER NOT NULL DEFAULT 30
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Seed default FAQ entries if table is empty
  const faqResult = db.exec("SELECT COUNT(*) as count FROM faq");
  const faqCount = faqResult[0]?.values[0]?.[0] as number;

  if (faqCount === 0) {
    const seedData = [
      ["شنو أوقات العمل؟", "نخدمو من الإثنين للسبت، من 9 الصباح حتى 5 العشية. يوم الأحد مسكّرين."],
      ["شنو الخدمات إلي تقدموها؟", "نقدمو قص شعر، صباغة، سوان الشعر، مانيكور، بيديكور، و ماساج."],
      ["شنو الأسعار؟", "قص شعر: 25 دينار، صباغة: 60 دينار، سوان: 40 دينار، مانيكور: 20 دينار، بيديكور: 25 دينار، ماساج: 80 دينار."],
      ["وين تتواجدو؟", "نتواجدو في شارع الحبيب بورقيبة، تونس العاصمة."],
      ["كيفاش نحجز موعد؟", "تنجم تحجز موعد هنا مباشرة! قلّي اسمك، النهار و الوقت إلي يناسبك."],
    ];

    for (const [question, answer] of seedData) {
      db.run("INSERT INTO faq (question, answer) VALUES (?, ?)", [question, answer]);
    }
    console.log("✅ Seeded default FAQ entries");
  }

  // Seed default settings
  const settingsResult = db.exec("SELECT COUNT(*) as count FROM settings");
  const settingsCount = settingsResult[0]?.values[0]?.[0] as number;

  if (settingsCount === 0) {
    const defaultPrompt = `أنت مساعد ذكي لصالون تجميل / عيادة في تونس. تجاوب دايما بالدارجة التونسية.

عندك 3 مهمات أساسية:
1. **الأسئلة المتكررة (FAQ)**: جاوب على الأسئلة حسب المعلومات إلي عندك.
2. **حجز المواعيد**: ساعد الناس يحجزوا مواعيد. استعمل الأدوات المتاحة باش تشوف الأيام و الأوقات المتاحة.
3. **محادثة عامة**: كون لطيف و ودود.

قواعد مهمة:
- دايما تجاوب بالدارجة التونسية
- كون مختصر و واضح
- إذا حد يحب يحجز موعد، اسأله على: الاسم، التاريخ، و الوقت
- قبل ما تأكد الحجز، أعد على الحريف المعلومات و اسأله إذا يأكد`;

    db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ["system_prompt", defaultPrompt]);
    db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ["business_name", "صالون الجمال"]);
    db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ["welcome_message", "مرحبا بيك! 👋 أنا المساعد الذكي متاع الصالون. كيفاش نجم نعاونك؟"]);
    console.log("✅ Seeded default settings");
  }

  saveDb();
  return db;
}

export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

export function getDb(): Database {
  if (!db) throw new Error("Database not initialized. Call initDb() first.");
  return db;
}

export default { initDb, getDb, saveDb };
