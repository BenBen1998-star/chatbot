import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Types
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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

// API calls
export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  apiUrl?: string
): Promise<ChatResponse> {
  if (apiUrl) {
    const { data } = await axios.post<ChatResponse>(`${apiUrl}/chat`, { message, history });
    return data;
  }
  const { data } = await api.post<ChatResponse>("/chat", { message, history });
  return data;
}

export async function confirmBooking(
  booking: { name: string; date: string; time: string },
  apiUrl?: string
): Promise<ChatResponse> {
  if (apiUrl) {
    const { data } = await axios.post<ChatResponse>(`${apiUrl}/chat/confirm`, booking);
    return data;
  }
  const { data } = await api.post<ChatResponse>("/chat/confirm", booking);
  return data;
}

export async function getAppointments(): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>("/appointments");
  return data;
}

export async function createAppointment(appt: {
  name: string;
  date: string;
  time: string;
}): Promise<Appointment> {
  const { data } = await api.post<Appointment>("/appointments", appt);
  return data;
}

export async function getFaqs(): Promise<FaqEntry[]> {
  const { data } = await api.get<FaqEntry[]>("/faq");
  return data;
}

export async function createFaq(faq: {
  question: string;
  answer: string;
}): Promise<FaqEntry> {
  const { data } = await api.post<FaqEntry>("/faq", faq);
  return data;
}

export async function updateFaq(
  id: number,
  faq: { question: string; answer: string }
): Promise<FaqEntry> {
  const { data } = await api.put<FaqEntry>(`/faq/${id}`, faq);
  return data;
}

export async function deleteFaq(id: number): Promise<void> {
  await api.delete(`/faq/${id}`);
}
