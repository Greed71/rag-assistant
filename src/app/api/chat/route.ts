import { NextRequest } from "next/server";
import { loadConfig, MAX_MESSAGE_LENGTH } from "@/lib/config";
import { createLLMClient } from "@/lib/llm";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ChatRequestBody, ChatStreamEvent } from "@/types";

function encode(event: ChatStreamEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

// x-forwarded-for is set by reverse proxies; falls back to loopback for local dev
function getClientIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
}

export async function POST(req: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ChatStreamEvent) => controller.enqueue(encode(event));

      try {
        const config = loadConfig();

        if (!checkRateLimit(getClientIP(req), config.rateLimitPerMinute)) {
          send({ type: "error", error: "Rate limit exceeded. Try again later." });
          return;
        }

        let body: ChatRequestBody;
        try {
          body = await req.json();
        } catch {
          send({ type: "error", error: "Invalid JSON body." });
          return;
        }

        const { message, history = [] } = body;

        if (!message || typeof message !== "string") {
          send({ type: "error", error: "message is required." });
          return;
        }
        if (message.length > MAX_MESSAGE_LENGTH) {
          send({ type: "error", error: `Message exceeds ${MAX_MESSAGE_LENGTH} characters.` });
          return;
        }

        const llm = createLLMClient({
          openaiApiKey: process.env.OPENAI_API_KEY,
          ollamaBaseUrl: process.env.OLLAMA_BASE_URL,
          vectorStoreId: config.vectorStoreId,
        });

        const messages = [
          ...history.slice(-config.maxHistoryMessages),
          { role: "user" as const, content: message },
        ];

        for await (const delta of llm.stream(messages, config.systemPrompt, config)) {
          send({ type: "delta", delta });
        }

        send({ type: "done" });
      } catch (err) {
        const error = err instanceof Error ? err.message : "Internal server error";
        send({ type: "error", error });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
    },
  });
}
