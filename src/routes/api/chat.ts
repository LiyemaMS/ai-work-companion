import { createFileRoute } from "@tanstack/react-router";
import { handleWorkplaceChat } from "@/lib/workplace-chat.server";

export const Route = createFileRoute("/api/chat")({
  server: { handlers: { POST: ({ request }) => handleWorkplaceChat(request) } },
});
