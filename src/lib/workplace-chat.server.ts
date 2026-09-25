import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { attachRunId, createRunIdFetch, requestRunId } from "./ai-gateway-run-id.server.ts";

const SYSTEM = `You are Workmate, an interactive AI workplace assistant. Help with workplace communication, planning, meeting preparation, prioritisation, brainstorming, and professional problem-solving. Be practical, concise, and supportive. Use markdown for scannable answers. Never invent facts, people, deadlines, company policies, or commitments. Clearly identify assumptions and ask for missing details when they materially affect the answer.`;

export async function handleWorkplaceChat(request: Request) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) return Response.json({ message: "AI is not configured for this workspace." }, { status: 401 });
  const payload = await request.json().catch(() => null) as { messages?: UIMessage[] } | null;
  if (!payload || !Array.isArray(payload.messages) || payload.messages.length > 100) {
    return Response.json({ message: "This conversation could not be processed." }, { status: 400 });
  }
  const gateway = createRunIdFetch(requestRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: gateway.fetch,
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: SYSTEM,
    messages: await convertToModelMessages(payload.messages),
    abortSignal: request.signal,
    providerOptions: { openai: { forceReasoning: true, reasoningEffort: "medium", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
  });
  return attachRunId(result.toUIMessageStreamResponse({ originalMessages: payload.messages, sendReasoning: true }), gateway);
}