export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
  // Arbitrary per-request metadata (character, room, user, etc.) — passed to context loaders
  context?: Record<string, unknown>;
}

export interface ChatStreamEvent {
  type: "delta" | "done" | "error" | "warning";
  delta?: string;
  error?: string;
  warning?: string;
}

export interface AssistantConfig {
  model: string;
  vectorStoreId?: string;
  systemPrompt: string;
  maxHistoryMessages: number;
  temperature: number;
  topP: number;
  maxTokens: number;
  rateLimitPerMinute: number;
}

export interface Document {
  id: string;
  content: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface Retriever {
  retrieve(query: string, k?: number): Promise<Document[]>;
}

export interface LLMClient {
  stream(
    messages: ChatMessage[],
    systemPrompt: string,
    config: Pick<AssistantConfig, "model" | "temperature" | "topP" | "maxTokens">
  ): AsyncIterable<string>;
}
