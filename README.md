# RAG Assistant

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-API-green)

**RAG Assistant** is a standalone framework for building AI assistants based on **Retrieval-Augmented Generation**. It combines:

- 🔗 **Vector Store Integration** — native support for OpenAI Vector Stores
- 🧠 **Pluggable LLM** — Support for OpenAI and local Ollama
- 🔄 **SSE Streaming** — Real-time responses via Server-Sent Events
- 🎯 **Fully Configurable** — Complete management of prompts and parameters via `.env`

## What You Can Do

```
┌─────────────────────────────┐
│  Custom Knowledge Base      │
│  (Vector Store: OpenAI,     │
│   Pinecone, Weaviate, ...)  │
└────────────┬────────────────┘
             ↓
   ┌─────────────────────┐
   │  RAG Assistant      │
   │  + Dynamic Context  │ ← Load from your DB
   │  + Custom Prompts   │
   └────────────┬────────┘
             ↓
     ┌─────────────────┐
     │  Your App UI    │
     │  (Next.js, SPA, │
     │   mobile, ...)  │
     └─────────────────┘
```

### Use Cases

- **TTRPG Assistants** (D&D, Pathfinder, Fate, etc.) — integrate rules + lore
- **Documentation Assistants** — answer questions about APIs, products, manuals
- **Customer Support** — RAG on company KB + FAQ
- **Learning Assistants** — RAG on curriculum + courses
- **Game Masters' Copilot** — campaign context + NPC/monster management

---

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Grimlight-Software/rag-assistant.git
cd rag-assistant
npm install
```

### 2. Configure `.env.local`

```env
# OpenAI (Default)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_VECTOR_STORE_ID=vs_...      # Optional: ID for RAG

# Optional: Local Ollama
# OLLAMA_BASE_URL=http://localhost:11434

# Assistant Config
NEXT_PUBLIC_SYSTEM_PROMPT="You are a helpful assistant..."
MAX_HISTORY_MESSAGES=10
LLM_TEMPERATURE=0.6
```

### 3. Start Development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | Next.js 15 + React 19 + TypeScript | App Router & Server Actions |
| **Backend API** | Next.js Route Handlers | SSE Streaming |
| **LLM** | OpenAI SDK | Ollama compatible |
| **Styling** | CSS Modules | Zero runtime dependencies |

---

## Architecture

### Request Flow

```
Client (UI)
    │
    ├─ POST /api/chat
    │  ├─ Body: { message, history }
    │
    ├─ Backend (route.ts)
    │  ├─ Rate limit check (In-memory)
    │  ├─ Load Config
    │  ├─ Initialize LLM Client
    │  └─ Stream chunks via SSE
    │
    └─ UI (ChatbotAssistant.tsx)
       ├─ Parse SSE stream
       └─ Render Markdown (react-markdown)
```

### Project Tree

```
rag-assistant/
├── README.md
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts              # Main endpoint (SSE)
│   │   │   ├── health/route.ts            # Liveness probe
│   │   │   └── config/route.ts            # Debug config (Dev only)
│   │   │
│   │   ├── page.tsx                       # Demo landing
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ChatbotAssistant.tsx           # Chat widget
│   │   ├── ChatbotAssistant.module.css
│   │   └── svg/                           # UI Icons
│   │
│   ├── lib/
│   │   ├── llm.ts                         # OpenAI/Ollama client
│   │   ├── rate-limit.ts                  # IP-based limiter
│   │   └── config.ts                      # Environment variable loader
│   │
│   ├── types/
│   │   └── index.ts                       # TypeScript interfaces
│   │
│   └── utils/                             # Internal utilities
│
└── public/                                # Static assets
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | - | Required API key for OpenAI |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model to use |
| `OPENAI_VECTOR_STORE_ID` | - | ID to enable file search (RAG) |
| `OLLAMA_BASE_URL` | - | Base URL for Ollama (e.g. http://localhost:11434) |
| `NEXT_PUBLIC_SYSTEM_PROMPT` | - | Assistant's initial instructions |
| `MAX_HISTORY_MESSAGES` | `10` | Number of previous messages to send |
| `LLM_TEMPERATURE` | `0.6` | Model creativity (0.0 - 1.0) |
| `RESPONSE_MAX_TOKENS` | `400` | Maximum response length |
| `RATE_LIMIT_PER_MINUTE` | `60` | Requests limit per IP per minute |

---

## Usage in Your Code

### Next.js Page

```tsx
import ChatbotAssistant from '@/components/ChatbotAssistant';

export default function GamePage() {
  return (
    <main>
      {/* Your game/app here */}
      
      {/* Chat widget */}
      <ChatbotAssistant />
    </main>
  );
}
```

---

## Development and Testing

### Lint

```bash
npm run lint
```

### Type Check

```bash
npm run type-check
```

---

## Deployment

### Vercel

```bash
vercel env add OPENAI_API_KEY
vercel env add OPENAI_VECTOR_STORE_ID
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t rag-assistant .
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-... \
  -e OPENAI_VECTOR_STORE_ID=vs_... \
  rag-assistant
```

### Sensitive Variables

**Use secrets**:
- GitHub Actions: Settings → Secrets
- Vercel: Dashboard → Environment Variables
- Docker/K8s: `.env` file (never in git)

---

## Advanced Configuration

### Rate Limiting

```env
RATE_LIMIT_PER_MINUTE=60          # Per IP
RATE_LIMIT_MESSAGE_LENGTH=2000    # Characters
```

### Memory & Performance

```env
MAX_HISTORY_MESSAGES=10           # Chat history to maintain
LLM_TIMEOUT_MS=120000             # Streaming timeout
RESPONSE_MAX_TOKENS=400           # Max response tokens
```

### Logging

```env
DEBUG=rag-assistant:*             # node-debug format
LOG_LEVEL=info                    # debug, info, warn, error
```

---

## Contributing

Forks and pull requests are welcome! For major changes, please open an issue first.

---

## License

MIT
