# 🤖 DevOpsAI — Multilingual AI Voice Interview & Learning Platform

A full-stack platform for practicing DevOps interviews by voice, in English, Hindi, or Marathi — with an AI assistant, quizzes, and progress tracking.

## Features

- 🔐 **JWT Authentication** — Register, Login, Logout, protected Dashboard, Profile (Node/Express + PostgreSQL + bcrypt)
- 🌐 **3 Languages** — English 🇬🇧, Hindi 🇮🇳, Marathi 🚩 (UI + interview + AI assistant)
- 🎤 **Multilingual Voice Interview** — pick a technology, language, and difficulty; the AI asks questions by voice, you answer by voice, AI evaluates and scores you
- 🤖 **DevOps AI Assistant** — chatbot that answers in whichever language is selected
- 📊 **Interview Reports** — technical / communication / confidence / overall scores per interview
- 🧠 **Learning Mode** — Quiz, Practice Interview, AI Assistant, and Progress tracking across 8 technologies: AWS, Docker, Kubernetes, Terraform, Jenkins, Linux, GitHub Actions, Monitoring

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, React Router, Axios |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | bcrypt + JSON Web Tokens |
| Voice | Browser Web Speech API (free, no API key needed) — Speech-to-Text and Text-to-Speech |
| AI | Any OpenAI-compatible Chat Completions API (question generation, answer scoring, assistant chat) — **optional**, the app has an offline fallback |

## Project Structure

```
devopsai-platform/
├── backend/               # Express API
│   ├── config/db.js       # PostgreSQL connection pool
│   ├── controllers/       # Route logic (auth, interview, quiz, assistant, progress)
│   ├── middleware/auth.js # JWT verification middleware
│   ├── models/schema.sql  # Database schema
│   ├── models/migrate.js  # Runs schema.sql against your DB
│   ├── routes/            # Express routers
│   ├── utils/              # AI client wrapper, language config
│   ├── server.js          # App entrypoint
│   └── .env.example       # Copy to .env and fill in
├── frontend/               # React app
│   ├── src/
│   │   ├── api/axios.js         # API client (reads VITE_API_URL)
│   │   ├── context/             # Auth + Language React contexts
│   │   ├── components/          # LanguageSelector, VoiceRecorder, ProtectedRoute
│   │   ├── pages/                # Login, Register, Dashboard, Interview, Quiz, Assistant, Progress
│   │   └── i18n/translations.js # UI text in en/hi/mr
│   └── .env.example
├── DEPLOYMENT.md           # Step-by-step AWS EC2 deployment guide
└── README.md               # This file
```

## ⚠️ Important — Read Before Running

This is a real, working codebase (backend boots cleanly, frontend builds with zero errors — both were verified). But two things depend on **your** setup:

1. **A PostgreSQL database must exist** and its credentials must be in `backend/.env`. Nothing will work without this.
2. **The AI features work in two modes:**
   - **With `AI_API_KEY` set** (recommended): real AI-generated interview questions, AI scoring/feedback, and a real AI assistant, in the selected language.
   - **Without it**: the app still runs fully end-to-end using a built-in offline question bank and a simple length-based scoring heuristic, so you can demo/test everything with zero cost. Swap in a key any time — no code changes needed.
3. **Voice input/output** uses the browser's own Web Speech API (Chrome/Edge). It's free and needs no key, but only works over **HTTPS or localhost** (browsers block microphone access on plain HTTP for non-localhost origins) — this matters for your EC2 deployment, see `DEPLOYMENT.md`.

## Local Setup (Development)

### 1. Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 13 (running locally or accessible remotely)

### 2. Database
```bash
# Create the database and a user (adjust names/passwords as you like)
sudo -u postgres psql
CREATE DATABASE devopsai;
CREATE USER devopsai_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE devopsai TO devopsai_user;
\q
```

### 3. Backend
```bash
cd backend
cp .env.example .env
# --> Edit .env: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET (see "What You Must Change" below)
npm install
npm run migrate      # creates all tables from models/schema.sql
npm run dev          # starts on http://localhost:5000
```

### 4. Frontend
```bash
cd frontend
cp .env.example .env
# --> Edit .env: VITE_API_URL (defaults to http://localhost:5000/api, fine for local dev)
npm install
npm run dev           # starts on http://localhost:5173
```

Open `http://localhost:5173`, register an account, and try it out.

## 🔧 What You MUST Change Before Deploying

| File | Variable | What to set it to |
|---|---|---|
| `backend/.env` | `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Your real PostgreSQL connection details |
| `backend/.env` | `JWT_SECRET` | A long random string — generate with `openssl rand -base64 48`. **Never use the example value.** |
| `backend/.env` | `FRONTEND_URL` | Your deployed frontend's URL (e.g. `http://YOUR_EC2_IP` or `https://yourdomain.com`) — required for CORS to work |
| `backend/.env` | `AI_API_KEY` (optional) | Your OpenAI (or compatible) API key, for real AI questions/scoring/assistant answers |
| `backend/.env` | `NODE_ENV` | `production` when deployed |
| `frontend/.env` | `VITE_API_URL` | Your deployed backend's API URL (e.g. `http://YOUR_EC2_IP:5000/api` or `https://yourdomain.com/api`) — **must be rebuilt** (`npm run build`) after changing this, since Vite bakes env vars in at build time |

Full step-by-step AWS EC2 deployment (including nginx reverse proxy, HTTPS, pm2, and where each of the above gets set on the server) is in **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

## API Overview

All routes below are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/logout` | Logout (protected) |
| GET | `/auth/profile` | Get profile (protected) |
| PUT | `/auth/profile` | Update profile (protected) |
| GET | `/interview/technologies` | List technologies + languages (protected) |
| POST | `/interview/start` | Start an interview (protected) |
| POST | `/interview/answer` | Submit an answer, get next question or final report (protected) |
| GET | `/interview/report/:id` | Full report for one interview (protected) |
| GET | `/interview/history` | List past interviews (protected) |
| POST | `/assistant/chat` | Chat with the AI assistant (protected) |
| GET | `/assistant/history` | Chat history (protected) |
| GET | `/quiz/:technology` | Get quiz questions (protected) |
| POST | `/quiz/submit` | Submit quiz answers (protected) |
| GET | `/progress` | Get learning progress (protected) |
| POST | `/progress/complete-topic` | Mark a topic complete (protected) |

## Known Limitations (Be Aware)

- Web Speech API browser support is best in Chrome/Edge; Firefox/Safari support for `SpeechRecognition` is limited or absent. The Interview page falls back gracefully to text input if unsupported.
- JWT logout is stateless (the token is simply discarded client-side) — there's no server-side token blacklist. Fine for most use cases; add one if you need instant token revocation.
- The offline (no-`AI_API_KEY`) scoring mode is a simple heuristic, not real evaluation — it's there so the app runs without any paid API, but for genuinely useful interview feedback, set `AI_API_KEY`.
