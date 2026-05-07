import OpenAI from "openai";
import type { ChatMessage, LLMClient, AssistantConfig } from "@/types";

type StreamConfig = Pick<AssistantConfig, "model" | "temperature" | "topP" | "maxTokens">;

class OpenAIClient implements LLMClient {
  private client: OpenAI;
  private vectorStoreId?: string;

  constructor(apiKey: string, vectorStoreId?: string) {
    this.client = new OpenAI({ apiKey });
    this.vectorStoreId = vectorStoreId;
  }

  async *stream(
    messages: ChatMessage[],
    systemPrompt: string,
    config: StreamConfig
  ): AsyncIterable<string> {
    if (this.vectorStoreId) {
      yield* this.streamWithRetrieval(messages, systemPrompt, config);
    } else {
      yield* this.streamChat(messages, systemPrompt, config);
    }
  }

  private async *streamWithRetrieval(
    messages: ChatMessage[],
    systemPrompt: string,
    config: StreamConfig
  ): AsyncIterable<string> {
    // Responses API handles chunking, embedding, and re-ranking internally via file_search.
    const events = (await this.client.responses.create({
      model: config.model,
      instructions: systemPrompt,
      input: messages.map((m) => ({ role: m.role, content: m.content })),
      tools: [{ type: "file_search", vector_store_ids: [this.vectorStoreId!] }],
      temperature: config.temperature,
      top_p: config.topP,
      max_output_tokens: config.maxTokens,
      stream: true,
    })) as AsyncIterable<any>;

    for await (const event of events) {
      if (event.type === "response.output_text.delta" && "delta" in event) {
        yield event.delta as string;
      }
    }
  }

  private async *streamChat(
    messages: ChatMessage[],
    systemPrompt: string,
    config: StreamConfig
  ): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: config.temperature,
      top_p: config.topP,
      max_tokens: config.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  }
}

// Ollama exposes an OpenAI-compatible endpoint, so we reuse the SDK with a custom base URL
class OllamaClient implements LLMClient {
  private client: OpenAI;

  constructor(baseUrl: string) {
    this.client = new OpenAI({ baseURL: `${baseUrl}/v1`, apiKey: "ollama" });
  }

  async *stream(
    messages: ChatMessage[],
    systemPrompt: string,
    config: StreamConfig
  ): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: config.temperature,
      top_p: config.topP,
      max_tokens: config.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  }
}

export function createLLMClient(opts: {
  openaiApiKey?: string;
  ollamaBaseUrl?: string;
  vectorStoreId?: string;
}): LLMClient {
  if (opts.ollamaBaseUrl) {
    return new OllamaClient(opts.ollamaBaseUrl);
  }
  if (!opts.openaiApiKey) {
    throw new Error("Either OPENAI_API_KEY or OLLAMA_BASE_URL must be set");
  }
  return new OpenAIClient(opts.openaiApiKey, opts.vectorStoreId);
}
