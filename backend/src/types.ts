export interface Appointment {
  id: number;
  name: string;
  date: string;
  time: string;
  created_at: string;
}

export interface FaqEntry {
  id: number;
  question: string;
  answer: string;
}

export interface AvailableDate {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  slot_interval: number;
}

export interface Setting {
  key: string;
  value: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  action?: "booking_prompt" | "booking_confirmed" | "show_slots" | "confirm_booking";
  slots?: string[];
  bookingData?: {
    name: string;
    date: string;
    time: string;
  };
}

export interface CreateAppointmentRequest {
  name: string;
  date: string;
  time: string;
}

export interface CreateFaqRequest {
  question: string;
  answer: string;
}
