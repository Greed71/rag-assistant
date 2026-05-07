import { loadConfig } from "@/lib/config";

// Never expose secrets — mask the vector store ID and block in production
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Not available in production" }, { status: 403 });
  }

  const config = loadConfig();
  return Response.json({
    model: config.model,
    vectorStoreId: config.vectorStoreId ? "[set]" : "[not set]",
    maxHistoryMessages: config.maxHistoryMessages,
    temperature: config.temperature,
    topP: config.topP,
    maxTokens: config.maxTokens,
    rateLimitPerMinute: config.rateLimitPerMinute,
  });
}
