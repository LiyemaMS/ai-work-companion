import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, Copy, LayoutDashboard, MessageCircle, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({ meta: [
    { title: "Workplace Assistant | AI Workplace Productivity Assistant" },
    { name: "description", content: "Chat with an interactive AI workplace assistant for practical communication, planning, and problem-solving support." },
    { property: "og:title", content: "Interactive AI Workplace Assistant" },
    { property: "og:description", content: "Practical AI support for workplace communication, planning, and problem-solving." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ChatPage,
});

type Thread = { id: string; title: string; updatedAt: string; messages: UIMessage[] };
const KEY = "awpa-chat-threads";

function readThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try { const value = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(value) ? value : []; } catch { return []; }
}
function persist(threads: Thread[]) { localStorage.setItem(KEY, JSON.stringify(threads)); }
function textOf(message: UIMessage) { return message.parts.filter((part) => part.type === "text").map((part) => part.text).join(""); }

function ChatPage() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readThreads();
    if (!stored.some((thread) => thread.id === threadId)) {
      const current = { id: threadId, title: "New conversation", updatedAt: new Date().toISOString(), messages: [] };
      persist([current, ...stored]); setThreads([current, ...stored]);
    } else setThreads(stored);
    setReady(true);
  }, [threadId]);

  const updateMessages = useCallback((messages: UIMessage[]) => {
    setThreads((all) => {
      const firstUser = messages.find((message) => message.role === "user");
      const titleText = firstUser ? textOf(firstUser).trim().slice(0, 42) : "New conversation";
      const next = all.map((thread) => thread.id === threadId ? { ...thread, title: titleText || thread.title, updatedAt: new Date().toISOString(), messages } : thread);
      persist(next); return next;
    });
  }, [threadId]);
  const createThread = () => { const id = crypto.randomUUID(); navigate({ to: "/chat/$threadId", params: { threadId: id } }); };
  const deleteThread = (id: string) => {
    const next = threads.filter((thread) => thread.id !== id); persist(next); setThreads(next);
    if (id === threadId) { const target = next[0]?.id ?? crypto.randomUUID(); navigate({ to: "/chat/$threadId", params: { threadId: target } }); }
  };
  const active = threads.find((thread) => thread.id === threadId);
  return <div className="flex min-h-screen bg-background text-foreground">
    <aside className="hidden w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
      <Link to="/" className="mb-6 flex items-center gap-3 px-2 py-2"><span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Bot className="size-5"/></span><span><strong className="block font-display">Workmate</strong><small className="text-muted-foreground">Workplace assistant</small></span></Link>
      <Button onClick={createThread} className="w-full"><Plus/>New conversation</Button>
      <p className="section-kicker mb-2 mt-7 px-2">Conversations</p>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto" aria-label="Conversations">{threads.map((thread) => <div key={thread.id} className={cn("group flex items-center rounded-lg", thread.id === threadId && "bg-sidebar-accent")}><Button variant="ghost" className="min-w-0 flex-1 justify-start px-3" onClick={() => navigate({ to: "/chat/$threadId", params: { threadId: thread.id } })}><MessageCircle className="shrink-0"/><span className="truncate">{thread.title}</span></Button><Button variant="ghost" size="icon" className="mr-1 size-8 opacity-0 group-hover:opacity-100 focus:opacity-100" onClick={() => deleteThread(thread.id)} aria-label={`Delete ${thread.title}`}><Trash2 className="size-4"/></Button></div>)}</nav>
      <Button asChild variant="ghost" className="mt-4 justify-start"><Link to="/"><LayoutDashboard/>Back to dashboard</Link></Button>
    </aside>
    <main className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-7"><div><p className="section-kicker">Interactive assistant</p><h1 className="font-display font-semibold">{active?.title ?? "New conversation"}</h1></div><div className="flex gap-2"><Button onClick={createThread} size="icon" variant="outline" className="md:hidden" aria-label="New conversation"><Plus/></Button><Button asChild size="icon" variant="outline" className="md:hidden"><Link to="/" aria-label="Dashboard"><LayoutDashboard/></Link></Button></div></header>
      <nav className="flex shrink-0 gap-2 overflow-x-auto border-b border-border bg-sidebar px-3 py-2 md:hidden" aria-label="Conversations">{threads.map((thread) => <Button key={thread.id} size="sm" variant={thread.id === threadId ? "secondary" : "ghost"} className="max-w-48 shrink-0" onClick={() => navigate({ to: "/chat/$threadId", params: { threadId: thread.id } })}><MessageCircle/><span className="truncate">{thread.title}</span></Button>)}</nav>
      {ready && active ? <ChatWindow key={threadId} thread={active} save={updateMessages}/> : <div className="grid flex-1 place-items-center text-sm text-muted-foreground">Loading conversation…</div>}
    </main>
  </div>;
}

function ChatWindow({ thread, save }: { thread: Thread; save: (messages: UIMessage[]) => void }) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat", body: { threadId: thread.id } }), [thread.id]);
  const { messages, sendMessage, status, stop, error } = useChat({ id: thread.id, messages: thread.messages, transport, onFinish: ({ messages: complete }) => { save(complete); requestAnimationFrame(() => inputRef.current?.focus()); } });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { if (messages.length) save(messages); }, [messages, save]);
  const submit = ({ text }: { text: string }) => { const clean = text.trim(); if (!clean || busy) return; void sendMessage({ text: clean }); requestAnimationFrame(() => inputRef.current?.focus()); };
  return <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-3 pb-4 pt-3 md:px-6 md:pb-6">
    <Conversation className="min-h-0 flex-1"><ConversationContent className="mx-auto w-full max-w-3xl px-1 py-6 md:px-4">{messages.length === 0 ? <ConversationEmptyState icon={<div className="grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground"><Bot className="size-8"/></div>} title="How can I help at work today?" description="Ask for help drafting, preparing, prioritising, analysing, or thinking through a workplace challenge."/> : messages.map((message) => <Message from={message.role} key={message.id}><MessageContent>{message.parts.map((part, index) => part.type === "text" ? <MessageResponse key={`${message.id}-${index}`}>{part.text}</MessageResponse> : null)}</MessageContent>{message.role === "assistant" && textOf(message) && <MessageActions><MessageAction tooltip="Copy response" onClick={() => navigator.clipboard.writeText(textOf(message))}><Copy className="size-4"/></MessageAction></MessageActions>}</Message>)}{status === "submitted" && <div className="flex items-center gap-3 text-sm text-muted-foreground"><span className="grid size-8 place-items-center rounded-lg bg-accent text-primary"><Bot className="size-4"/></span><Shimmer>Thinking…</Shimmer></div>}</ConversationContent><ConversationScrollButton/></Conversation>
    {error && <p className="mb-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error.message || "The assistant could not reply. Please try again."}</p>}
    <div className="mx-auto w-full max-w-3xl"><PromptInput onSubmit={submit}><PromptInputTextarea ref={inputRef} autoFocus placeholder="Ask Workmate anything about your work…"/><PromptInputFooter className="justify-between"><span className="px-1 text-xs text-muted-foreground">AI can make mistakes. Verify important details.</span><PromptInputSubmit status={status} onStop={stop} disabled={!busy && status === "error"}/></PromptInputFooter></PromptInput></div>
  </div>;
}