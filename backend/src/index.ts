import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initDb } from "./db.js";
import chatRouter from "./routes/chat.js";
import appointmentsRouter from "./routes/appointments.js";
import faqRouter from "./routes/faq.js";
import settingsRouter from "./routes/settings.js";
import availabilityRouter from "./routes/availability.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/chat", chatRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/faq", faqRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/availability", availabilityRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Serve frontend widget static files
const widgetDir = path.join(__dirname, "..", "public", "widget");
app.use("/widget", express.static(widgetDir));

// Serve dashboard static files (SPA)
const dashboardDir = path.join(__dirname, "..", "public", "dashboard");
app.use(express.static(dashboardDir));

// SPA fallback — serve dashboard index.html for non-API, non-widget routes
app.get("*", (req, res) => {
  if (req.path.startsWith("/widget/")) {
    res.status(404).send("Not found");
    return;
  }
  res.sendFile(path.join(dashboardDir, "index.html"));
});

// Initialize DB then start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
