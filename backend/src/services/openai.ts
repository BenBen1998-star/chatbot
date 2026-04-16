import OpenAI from "openai";
import { getDb } from "../db.js";
import type { ChatMessage, ChatResponse, FaqEntry } from "../types.js";
import { getAvailableSlots, isSlotAvailable } from "./booking.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_TOOL_ITERATIONS = 5;

// ── Helper functions ──────────────────────────────────────────────

function getFaqContext(): string {
  const db = getDb();
  const result = db.exec("SELECT * FROM faq");
  if (result.length === 0) return "ما فماش معلومات FAQ متوفرة حاليا.";
  const cols = result[0].columns;
  const faqs = result[0].values.map((vals: any[]) => {
    const row: Record<string, unknown> = {};
    cols.forEach((col: string, i: number) => { row[col] = vals[i]; });
    return row as unknown as FaqEntry;
  });
  return faqs.map((f: FaqEntry) => `سؤال: ${f.question}\nجواب: ${f.answer}`).join("\n\n");
}

function getSetting(key: string, fallback: string): string {
  const db = getDb();
  const result = db.exec("SELECT value FROM settings WHERE key = ?", [key]);
  if (result.length === 0 || result[0].values.length === 0) return fallback;
  return result[0].values[0][0] as string;
}

function getAvailableDatesFromDb(): { date: string; start_time: string; end_time: string }[] {
  const db = getDb();
  const today = new Date().toISOString().split("T")[0];
  const result = db.exec(
    "SELECT date, start_time, end_time FROM available_dates WHERE date >= ? ORDER BY date ASC LIMIT 14",
    [today]
  );
  if (result.length === 0) return [];
  return result[0].values.map((v: any[]) => ({
    date: v[0] as string,
    start_time: v[1] as string,
    end_time: v[2] as string,
  }));
}

// ── OpenAI Tool definitions ──────────────────────────────────────

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_available_dates",
      description: "Get the list of upcoming dates that are available for booking appointments. Call this when the user wants to book and you need to know which dates are open.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_available_slots",
      description: "Get the available (not-yet-booked) time slots for a specific date. Call this after the user picks a date, to show them the open times.",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "The date in YYYY-MM-DD format" },
        },
        required: ["date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_booking",
      description: "Create a new appointment booking. Call this ONLY after you have collected the customer's name, date (YYYY-MM-DD), and time (HH:MM), AND the customer has confirmed they want to proceed.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Customer's name" },
          date: { type: "string", description: "Appointment date in YYYY-MM-DD format" },
          time: { type: "string", description: "Appointment time in HH:MM format" },
        },
        required: ["name", "date", "time"],
      },
    },
  },
];

// ── Tool execution ──────────────────────────────────────────────

function executeTool(
  name: string,
  args: Record<string, string>
): { result: string; pending?: ChatResponse } {
  switch (name) {
    case "get_available_dates": {
      const dates = getAvailableDatesFromDb();
      if (dates.length === 0) {
        return { result: JSON.stringify({ dates: [], note: "No specific dates configured. Default hours 09:00-17:00 every day." }) };
      }
      return { result: JSON.stringify({ dates }) };
    }
    case "get_available_slots": {
      const date = args.date;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return { result: JSON.stringify({ error: "Invalid date format. Use YYYY-MM-DD." }) };
      }
      const slots = getAvailableSlots(date);
      return { result: JSON.stringify({ date, available_slots: slots, count: slots.length }) };
    }
    case "create_booking": {
      const { name: customerName, date, time } = args;
      if (!customerName || !date || !time) {
        return { result: JSON.stringify({ error: "Missing required fields: name, date, time" }) };
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return { result: JSON.stringify({ error: "Invalid date format. Use YYYY-MM-DD." }) };
      }
      if (!/^\d{2}:\d{2}$/.test(time)) {
        return { result: JSON.stringify({ error: "Invalid time format. Use HH:MM." }) };
      }
      if (!isSlotAvailable(date, time)) {
        const available = getAvailableSlots(date);
        return {
          result: JSON.stringify({
            error: `Slot ${time} on ${date} is already booked`,
            available_slots: available,
          }),
        };
      }
      // Don't book yet — return pending confirmation to frontend
      return {
        result: JSON.stringify({ status: "pending_confirmation" }),
        pending: {
          reply: "",
          action: "confirm_booking",
          bookingData: { name: customerName, date, time },
        },
      };
    }
    default:
      return { result: JSON.stringify({ error: `Unknown function: ${name}` }) };
  }
}

// ── Build system prompt ─────────────────────────────────────────

function buildSystemPrompt(): string {
  const userPrompt = getSetting("system_prompt", "You are a helpful assistant.");
  const faqContext = getFaqContext();
  const today = new Date().toISOString().split("T")[0];
  const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const todayDayName = dayNames[new Date().getDay()];

  return `${userPrompt}

--- معلومات الصالون ---
${faqContext}

--- تعليمات النظام ---
اليوم هو ${today} (${todayDayName}).

تحويل التواريخ بالدارجة التونسية:
- "غدوة" / "غدوا" = غداً = اليوم + 1
- "بعد غدوة" = بعد غد = اليوم + 2
- "اليوم" = ${today}
- "الإثنين الجاي" / "الثلاثاء الجاي" الخ = أقرب يوم من ذلك الأسبوع الجاي
احسب التاريخ الفعلي بصيغة YYYY-MM-DD قبل ما تستعمل الأدوات.

خطوات الحجز:
1. كي يحب الحريف يحجز، استعمل get_available_dates باش تعرف الأيام المتاحة
2. كي يختار نهار، استعمل get_available_slots باش تعرف الأوقات المتاحة
3. اجمع: الاسم + التاريخ + الوقت
4. قبل ما تعمل create_booking، أعد على الحريف المعلومات و اسأله "تأكد؟"
5. كي يأكد، استعمل create_booking

ملاحظات:
- تجاوب دايما بالدارجة التونسية
- كون مختصر و ودود
- ما تعملش create_booking من غير ما الحريف يأكد`;
}

// ── Main chat processing ────────────────────────────────────────

export async function processChat(
  message: string,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  const systemPrompt = buildSystemPrompt();

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 500,
      tools,
    });

    const choice = completion.choices[0];
    const assistantMsg = choice.message;

    // If no tool calls, return the text reply
    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      return { reply: assistantMsg.content ?? "سامحني، ما فهمتش. عاود حاول." };
    }

    // Process tool calls
    messages.push(assistantMsg);

    for (const toolCall of assistantMsg.tool_calls) {
      let args: Record<string, string>;
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch {
        args = {};
      }

      const { result, pending } = executeTool(toolCall.function.name, args);

      // If create_booking was called, return confirmation request to frontend
      if (pending) {
        // Use the last text content from the assistant or generate a summary
        const lastReply = assistantMsg.content ?? "";
        return {
          ...pending,
          reply: lastReply || pending.reply,
        };
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });
    }
  }

  // Safety: exceeded max iterations
  return { reply: "سامحني، صار مشكل. عاود حاول." };
}
