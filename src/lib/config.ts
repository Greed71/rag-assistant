import type { AssistantConfig } from "@/types";

export function loadConfig(): AssistantConfig {
  return {
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    vectorStoreId: process.env.OPENAI_VECTOR_STORE_ID,
    systemPrompt:
      process.env.NEXT_PUBLIC_SYSTEM_PROMPT ??
      "You are a helpful assistant. Answer clearly and concisely. If you don't know the answer, say so.",
    maxHistoryMessages: parseInt(process.env.MAX_HISTORY_MESSAGES ?? "10", 10),
    temperature: parseFloat(process.env.LLM_TEMPERATURE ?? "0.6"),
    topP: parseFloat(process.env.LLM_TOP_P ?? "0.9"),
    maxTokens: parseInt(process.env.RESPONSE_MAX_TOKENS ?? "400", 10),
    rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE ?? "60", 10),
  };
}

export const MAX_MESSAGE_LENGTH = parseInt(
  process.env.RATE_LIMIT_MESSAGE_LENGTH ?? "2000",
  10
);
