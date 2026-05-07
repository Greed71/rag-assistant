# RAG Assistant

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-API-green)

**RAG Assistant** è un framework standalone per costruire assistenti IA basati su **Retrieval-Augmented Generation**. Combina:

- 🔗 **Vector Store Integration** — supporto nativo per OpenAI Vector Stores
- 🧠 **LLM Pluggable** — Supporto per OpenAI e Ollama locale
- 🔄 **Streaming SSE** — Risposte in tempo reale tramite Server-Sent Events
- 🎯 **Fully Configurable** — Gestione completa di prompt e parametri via `.env`

## Cosa Puoi Fare

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

### Casi d'Uso

- **TTRPG Assistants** (D&D, Pathfinder, Fate, ecc.) — integra regole + lore
- **Documentation Assistants** — rispondi a domande su API, prodotti, manuali
- **Customer Support** — RAG su KB aziendale + FAQ
- **Learning Assistants** — RAG su curriculum + corsi
- **Game Masters' Copilot** — contesto di campagna + gestione PNG/mostri

---

## Quick Start

### 1. Clona e Installa

```bash
git clone https://github.com/Grimlight-Software/rag-assistant.git
cd rag-assistant
npm install
```

### 2. Configura `.env.local`

```env
# OpenAI (Default)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_VECTOR_STORE_ID=vs_...      # Opzionale: ID per RAG

# Opzionale: Ollama locale
# OLLAMA_BASE_URL=http://localhost:11434

# Assistant Config
NEXT_PUBLIC_SYSTEM_PROMPT="Tu sei un assistente utile..."
MAX_HISTORY_MESSAGES=10
LLM_TEMPERATURE=0.6
```

### 3. Avvia lo Sviluppo

```bash
npm run dev
```

Apri `http://localhost:3000` nel browser.

---

## Stack Tecnologico

| Layer | Tecnologia | Note |
|---|---|---|
| **Frontend** | Next.js 15 + React 19 + TypeScript | App Router & Server Actions |
| **Backend API** | Next.js Route Handlers | Streaming SSE |
| **LLM** | OpenAI SDK | Compatibile con Ollama |
| **Styling** | CSS Modules | Zero runtime dependencies |

---

## Architettura

### Flusso Richiesta

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

### Albero Progetto

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
│   │   │   ├── chat/route.ts              # Endpoint principale (SSE)
│   │   │   ├── health/route.ts            # Liveness probe
│   │   │   └── config/route.ts            # Debug config (Dev only)
│   │   │
│   │   ├── page.tsx                       # Demo landing
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ChatbotAssistant.tsx           # Widget chat
│   │   ├── ChatbotAssistant.module.css
│   │   └── svg/                           # Icone UI
│   │
│   ├── lib/
│   │   ├── llm.ts                         # Client OpenAI/Ollama
│   │   ├── rate-limit.ts                  # Limiter IP-based
│   │   └── config.ts                      # Loader variabili d'ambiente
│   │
│   ├── types/
│   │   └── index.ts                       # Interfacce TypeScript
│   │
│   └── utils/                             # Utility interne
│
└── public/                                # Asset statici
```

---

## Configurazione

### Variabili d'Ambiente

| Variabile | Default | Descrizione |
|---|---|---|
| `OPENAI_API_KEY` | - | Chiave API richiesta per OpenAI |
| `OPENAI_MODEL` | `gpt-4o-mini` | Modello da utilizzare |
| `OPENAI_VECTOR_STORE_ID` | - | ID per abilitare la ricerca nei file (RAG) |
| `OLLAMA_BASE_URL` | - | Base URL per Ollama (es. http://localhost:11434) |
| `NEXT_PUBLIC_SYSTEM_PROMPT` | - | Istruzioni iniziali dell'assistente |
| `MAX_HISTORY_MESSAGES` | `10` | Numero di messaggi precedenti da inviare |
| `LLM_TEMPERATURE` | `0.6` | Creatività del modello (0.0 - 1.0) |
| `RESPONSE_MAX_TOKENS` | `400` | Lunghezza massima della risposta |
| `RATE_LIMIT_PER_MINUTE` | `60` | Limite richieste per IP al minuto |

---

## Uso nel Tuo Codice

### Next.js Page

```tsx
import ChatbotAssistant from '@/components/ChatbotAssistant';

export default function GamePage() {
  return (
    <main>
      {/* Tuo gioco/app qui */}
      
      {/* Widget chat */}
      <ChatbotAssistant />
    </main>
  );
}
```

---

## Sviluppo e Testing

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

### Variabili Sensibili

**Usa secrets**:
- GitHub Actions: Settings → Secrets
- Vercel: Dashboard → Environment Variables
- Docker/K8s: `.env` file (mai in git)

---

## Configurazione Avanzata

### Rate Limiting

```env
RATE_LIMIT_PER_MINUTE=60          # Per IP
RATE_LIMIT_MESSAGE_LENGTH=2000    # Caratteri
```

### Memory & Performance

```env
MAX_HISTORY_MESSAGES=10           # Chat history da mantenere
LLM_TIMEOUT_MS=120000             # Timeout streaming
RESPONSE_MAX_TOKENS=400           # Max token risposta
```

### Logging

```env
DEBUG=rag-assistant:*             # node-debug format
LOG_LEVEL=info                    # debug, info, warn, error
```

---

## Contribuire

Forks e pull requests sono benvenuti! Per cambiamenti importanti, apri un issue prima.

---

## License

MIT
