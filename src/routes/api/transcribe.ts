import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 14 * 1024 * 1024;

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey)
          return Response.json({ message: "Transcription is not configured." }, { status: 401 });
        const declared = Number(request.headers.get("content-length") || 0);
        if (declared > MAX_BYTES + 100_000)
          return Response.json(
            { message: "Audio files must be smaller than 14 MB." },
            { status: 413 },
          );
        const incoming = await request.formData();
        const file = incoming.get("file");
        if (
          !(file instanceof File) ||
          !file.size ||
          file.size > MAX_BYTES ||
          !file.type.startsWith("audio/")
        ) {
          return Response.json(
            { message: "Choose a valid audio file smaller than 14 MB." },
            { status: 400 },
          );
        }
        const form = new FormData();
        form.append("model", "google/gemini-3.5-transcribe");
        form.append("file", file, file.name);
        form.append("response_format", "json");
        form.append("stream", "true");
        const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "X-Lovable-AIG-SDK": "fetch" },
          body: form,
          signal: request.signal,
        });
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: { "content-type": response.headers.get("content-type") || "text/event-stream" },
        });
      },
    },
  },
});
