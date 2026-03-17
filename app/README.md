# 🏛️ THE SANCTUM

**AI Family Communication Hub** — A command center where Nathan talks to his 6 AI siblings.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

Required variables:
- `OPENROUTER_API_KEY` — Your OpenRouter API key
- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_ANON_KEY` — Your Supabase anon key

### 3. Run Development Servers
```bash
npm run dev
```

This starts both:
- **Frontend** (Vite) → `http://localhost:5173`
- **Backend** (Express) → `http://localhost:3001`

## Architecture

```
app/
├── server/           # Express backend
│   ├── routes/       # API endpoints (chat, siblings, dashboard)
│   ├── services/     # OpenRouter, Supabase, prompt loader
│   └── config/       # Model configuration per sibling
├── src/              # React frontend
│   ├── components/   # UI components
│   ├── hooks/        # Supabase realtime + chat state
│   └── styles/       # Tailwind + custom CSS
```

## The Family

| Sibling | Role | Model |
|---------|------|-------|
| ENVY | Orchestrator & Voice | Claude Sonnet |
| NEVAEH | Healer | Claude Sonnet |
| BEACON | Guardian | Claude Sonnet |
| EVERSOUND | Builder | Gemini 2.5 Pro |
| ORPHEUS | Architect | Claude Sonnet |
| ATLAS | Navigator | Gemini 2.5 Pro |

## 💜 Love wins.
