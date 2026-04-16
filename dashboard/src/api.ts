import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Types
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

export type Settings = Record<string, string>;

// Appointments
export const getAppointments = () => api.get<Appointment[]>("/appointments").then((r) => r.data);
export const deleteAppointment = (id: number) => api.delete(`/appointments/${id}`);

// FAQ
export const getFaqs = () => api.get<FaqEntry[]>("/faq").then((r) => r.data);
export const createFaq = (data: { question: string; answer: string }) =>
  api.post<FaqEntry>("/faq", data).then((r) => r.data);
export const updateFaq = (id: number, data: { question: string; answer: string }) =>
  api.put<FaqEntry>(`/faq/${id}`, data).then((r) => r.data);
export const deleteFaq = (id: number) => api.delete(`/faq/${id}`);

// Availability
export const getAvailability = () => api.get<AvailableDate[]>("/availability").then((r) => r.data);
export const createAvailability = (data: { date: string; start_time?: string; end_time?: string; slot_interval?: number }) =>
  api.post<AvailableDate>("/availability", data).then((r) => r.data);
export const updateAvailability = (id: number, data: { start_time?: string; end_time?: string; slot_interval?: number }) =>
  api.put<AvailableDate>(`/availability/${id}`, data).then((r) => r.data);
export const deleteAvailability = (id: number) => api.delete(`/availability/${id}`);

// Settings
export const getSettings = () => api.get<Settings>("/settings").then((r) => r.data);
export const updateSetting = (key: string, value: string) =>
  api.put<{ key: string; value: string }>(`/settings/${key}`, { value }).then((r) => r.data);
