# 🤖 AI Appointment Booking + FAQ Assistant

SaaS MVP for small businesses (salons/clinics) — AI-powered chatbot that handles FAQ and appointment booking in Tunisian dialect.

## Tech Stack

- **Frontend**: React (Vite) + Chakra UI + TypeScript
- **Backend**: Node.js (Express) + TypeScript
- **Database**: SQLite (better-sqlite3)
- **AI**: OpenAI API (gpt-4o-mini)

## Project Structure

```
work/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server
│   │   ├── db.ts                 # SQLite setup + seed data
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── routes/
│   │   │   ├── chat.ts           # POST /api/chat
│   │   │   ├── appointments.ts   # GET/POST /api/appointments
│   │   │   └── faq.ts            # CRUD /api/faq
│   │   └── services/
│   │       ├── openai.ts         # OpenAI integration
│   │       └── booking.ts        # Slot availability logic
│   └── data/                     # SQLite file (auto-created)
├── frontend/
│   └── src/
│       ├── App.tsx               # Router (Chat + Dashboard)
│       ├── api.ts                # API client
│       ├── pages/
│       │   ├── ChatPage.tsx      # WhatsApp-style chat
│       │   └── DashboardPage.tsx # Admin panel
│       └── components/
│           ├── ChatBubble.tsx
│           ├── ChatInput.tsx
│           ├── AppointmentList.tsx
│           └── FaqForm.tsx
└── README.md
```

## Setup & Run

### 1. Backend

```bash
cd backend

# Add your OpenAI API key
# Edit .env and replace sk-your-api-key-here with your actual key
notepad .env

# Install dependencies (already done if you followed setup)
npm install

# Start dev server (port 3001)
npm run dev
```

### 2. Frontend

```bash
cd frontend

# Install dependencies (already done if you followed setup)
npm install

# Start dev server (port 5173)
npm run dev
```

### 3. Open in browser

- **Chat**: http://localhost:5173/
- **Dashboard**: http://localhost:5173/dashboard

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to AI assistant |
| GET | `/api/appointments` | List all appointments |
| POST | `/api/appointments` | Create appointment |
| GET | `/api/faq` | List all FAQ entries |
| POST | `/api/faq` | Create FAQ entry |
| PUT | `/api/faq/:id` | Update FAQ entry |
| DELETE | `/api/faq/:id` | Delete FAQ entry |
| GET | `/api/health` | Health check |

## Features

- **Chat Assistant**: AI responds in Tunisian dialect (Derja), handles FAQ questions and appointment booking
- **Smart Booking**: Detects booking intent, asks for details, checks slot availability (09:00–17:00, 30-min intervals), auto-confirms
- **FAQ System**: Pre-seeded with salon info (services, prices, hours). Admin can add/edit/delete entries
- **Admin Dashboard**: View appointments table + manage FAQ entries
- **Mobile-friendly**: Responsive WhatsApp-style chat UI

## Configuration

- **OpenAI Model**: `gpt-4o-mini` (change in `backend/src/services/openai.ts`)
- **Time Slots**: 09:00–17:00, 30-min intervals (change in `backend/src/services/booking.ts`)
- **Backend Port**: 3001 (change in `backend/.env`)
- **Frontend Port**: 5173 (change in `frontend/vite.config.ts`)
