import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb } from "./db.js";
import chatRouter from "./routes/chat.js";
import appointmentsRouter from "./routes/appointments.js";
import faqRouter from "./routes/faq.js";
import settingsRouter from "./routes/settings.js";
import availabilityRouter from "./routes/availability.js";

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

// Initialize DB then start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
