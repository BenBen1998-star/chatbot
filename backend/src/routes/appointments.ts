import { Router, Request, Response } from "express";
import { getAllAppointments, isSlotAvailable, createAppointment, deleteAppointment } from "../services/booking.js";
import type { CreateAppointmentRequest } from "../types.js";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const appointments = getAllAppointments();
  res.json(appointments);
});

router.post("/", (req: Request<unknown, unknown, CreateAppointmentRequest>, res: Response) => {
  try {
    const { name, date, time } = req.body;

    if (!name || !date || !time) {
      res.status(400).json({ error: "name, date, and time are required" });
      return;
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: "date must be in YYYY-MM-DD format" });
      return;
    }

    // Validate time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(time)) {
      res.status(400).json({ error: "time must be in HH:MM format" });
      return;
    }

    if (!isSlotAvailable(date, time)) {
      res.status(409).json({ error: "This time slot is already booked" });
      return;
    }

    const appointment = createAppointment(name, date, time);
    res.status(201).json(appointment);
  } catch (error) {
    console.error("Appointment error:", error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

router.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = deleteAppointment(Number(id));
    if (!deleted) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Appointment delete error:", error);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

export default router;
