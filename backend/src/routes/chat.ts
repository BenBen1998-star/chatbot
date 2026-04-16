import { Router, Request, Response } from "express";
import { processChat } from "../services/openai.js";
import { isSlotAvailable, createAppointment } from "../services/booking.js";
import type { ChatRequest, CreateAppointmentRequest } from "../types.js";

const router = Router();

router.post("/", async (req: Request<unknown, unknown, ChatRequest>, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const result = await processChat(message, history ?? []);
    res.json(result);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

router.post("/confirm", (req: Request<unknown, unknown, CreateAppointmentRequest>, res: Response) => {
  try {
    const { name, date, time } = req.body;

    if (!name || !date || !time) {
      res.status(400).json({ error: "name, date, and time are required" });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: "date must be in YYYY-MM-DD format" });
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      res.status(400).json({ error: "time must be in HH:MM format" });
      return;
    }

    if (!isSlotAvailable(date, time)) {
      res.status(409).json({
        reply: `⚠️ الوقت ${time} نهار ${date} وللى محجوز. اختار وقت آخر.`,
        action: "show_slots",
        error: "Slot no longer available",
      });
      return;
    }

    const appointment = createAppointment(name, date, time);
    res.json({
      reply: `✅ تم الحجز! ${name}، موعدك نهار ${date} على الساعة ${time}. نستناوك! 😊`,
      action: "booking_confirmed",
      bookingData: { name, date, time },
    });
  } catch (error) {
    console.error("Booking confirm error:", error);
    res.status(500).json({ error: "Failed to confirm booking" });
  }
});

export default router;
