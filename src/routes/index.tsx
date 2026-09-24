import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, CalendarDays, Check, CheckCircle2, Clipboard, Clock3, Copy,
  FileText, LayoutDashboard, Mail, Menu, Pencil, Plus, RefreshCw, Save,
  Settings, Target, UserRound, Wand2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "AI Workplace Productivity Assistant" },
    { name: "description", content: "Create professional emails, structured meeting summaries, and realistic work plans in one focused workspace." },
    { property: "og:title", content: "AI Workplace Productivity Assistant" },
    { property: "og:description", content: "A focused workspace for emails, meeting notes, and task planning." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: ProductivityApp,
});

type View = "dashboard" | "email" | "meeting" | "planner" | "settings";
type SavedItem = { id: string; type: string; title: string; content: string; date: string };
type PlanItem = { id: string; time: string; title: string; detail: string; urgent: boolean; done: boolean };

const nav = [
  { id: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
  { id: "email" as View, label: "Smart Email", icon: Mail },
  { id: "meeting" as View, label: "Meeting Notes", icon: FileText },
  { id: "planner" as View, label: "Task Planner", icon: CalendarDays },
];

const fieldClass = "w-full rounded-lg border border-input bg-card px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25";

function splitItems(value: string) {
  return value.split(/\n|,|;/).map((s) => s.trim().replace(/^[-•*]\s*/, "")).filter(Boolean);
}
function titleCase(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function greetingName(audience: string, tone: string) {
  const clean = audience.trim();
  if (!clean) return tone === "Formal" ? "Hello," : "Hi there,";
  return tone === "Formal" ? `Dear ${clean},` : `Hi ${clean},`;
}

function makeEmail(f: EmailForm, variation: number) {
  const points = splitItems(f.points);
  const purpose = f.purpose.trim();
  const outcome = f.outcome.trim();
  const subject = titleCase(purpose || "Workplace update");
  const opener = f.tone === "Formal" ? "I am writing regarding" : f.tone === "Persuasive" ? "I’d like to share an important proposal regarding" : "I wanted to reach out about";
  const transitions = ["To give you the essential context", "The main points to consider", "Here is what matters most"];
  const body: string[] = [greetingName(f.recipient, f.tone), "", `${opener} ${purpose || "this matter"}.`];
  if (points.length) {
    body.push("", `${transitions[variation % transitions.length]}:`, ...points.map((p) => `• ${p}`));
  }
  if (f.length !== "Concise" && points.length) body.push("", "These points should help keep the next steps clear and aligned.");
  if (outcome) body.push("", f.tone === "Persuasive" ? `I’d appreciate your support in helping us ${outcome}.` : `The desired outcome is to ${outcome}.`);
  if (f.length === "Detailed") body.push("", "Please let me know if you need any additional context or would like to discuss the details together.");
  body.push("", f.tone === "Formal" ? "Kind regards," : "Best regards,", "[Your name]");
  return { subject, body: body.join("\n") };
}

type EmailForm = { purpose: string; recipient: string; points: string; outcome: string; tone: string; length: string };
const emptyEmail: EmailForm = { purpose: "", recipient: "", points: "", outcome: "", tone: "Friendly", length: "Standard" };

function analyseNotes(notes: string, variation: number) {
  const lines = notes.split(/\n|(?<=[.!?])\s+/).map((x) => x.trim().replace(/^[-•*]\s*/, "")).filter((x) => x.length > 2);
  const decisions = lines.filter((x) => /decid|agreed|approved|confirmed|will proceed/i.test(x));
  const actions = lines.filter((x) => /action|will |needs? to|assigned|responsible|follow up|send|prepare|complete|review/i.test(x));
  const deadlines = lines.filter((x) => /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|deadline|due|by \w+|\d{1,2}[/-]\d{1,2}|\d{1,2}:\d{2})\b/i.test(x));
  const summaryLines = lines.slice(0, variation % 2 ? 4 : 3);
  return [
    "MEETING SUMMARY", summaryLines.length ? summaryLines.join(" ") : "No clear discussion points were provided.", "",
    "KEY DECISIONS", ...(decisions.length ? decisions.map((x) => `• ${x}`) : ["• No confirmed decisions were identified."]), "",
    "ACTION ITEMS", ...(actions.length ? actions.map((x) => `• ${x}`) : ["• No explicit action items were identified."]), "",
    "DEADLINES", ...(deadlines.length ? deadlines.map((x) => `• ${x}`) : ["• No deadlines were specified."]), "",
    "FOLLOW-UPS", actions.length ? "• Confirm ownership and completion status for the action items above." : "• Clarify next steps and responsible people.", "",
    "MISSING INFORMATION", ...(!actions.length ? ["• Responsible people are not specified."] : []), ...(!deadlines.length ? ["• Dates or deadlines are not specified."] : []),
  ].join("\n");
}

function buildPlan(tasksText: string, hoursText: string, deadline: string, priority: string, mode: string, variation: number): PlanItem[] {
  const tasks = splitItems(tasksText);
  const totalHours = Math.max(1, Number.parseFloat(hoursText) || 8);
  const days = mode === "Weekly" ? 5 : 1;
  const each = Math.max(.5, Math.min(2, totalHours / Math.max(tasks.length, 1)));
  const start = 9 + (variation % 2);
  return tasks.map((task, index) => {
    const day = mode === "Weekly" ? ["Mon", "Tue", "Wed", "Thu", "Fri"][index % days] : "Today";
    const slot = Math.floor(index / days);
    const hour = start + Math.floor(slot * each);
    const mins = Math.round((slot * each % 1) * 60).toString().padStart(2, "0");
    return { id: `${Date.now()}-${index}`, time: `${day} · ${hour.toString().padStart(2, "0")}:${mins}`, title: task, detail: `${each.toFixed(each % 1 ? 1 : 0)}h focus block${deadline ? ` · due ${deadline}` : ""}`, urgent: priority === "High" || index === 0, done: false };
  });
}

function ProductivityApp() {
  const [view, setView] = useState<View>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [profile, setProfile] = useState({ name: "Alex Morgan", role: "Product Operations" });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const items = localStorage.getItem("awpa-saved");
      const person = localStorage.getItem("awpa-profile");
      if (items) setSaved(JSON.parse(items) as SavedItem[]);
      if (person) setProfile(JSON.parse(person) as typeof profile);
    } catch { /* keep safe defaults */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("awpa-saved", JSON.stringify(saved)); }, [saved, ready]);
  useEffect(() => { if (ready) localStorage.setItem("awpa-profile", JSON.stringify(profile)); }, [profile, ready]);

  const saveOutput = (item: Omit<SavedItem, "id" | "date">) => setSaved((s) => [{ ...item, id: crypto.randomUUID(), date: "Just now" }, ...s].slice(0, 12));
  const go = (v: View) => { setView(v); setMobileOpen(false); };
  return (
    <div className="min-h-screen bg-background text-foreground">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-overlay lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar p-5 transition-transform lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-9 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft"><Wand2 className="size-5" /></div><div><p className="font-display text-base font-semibold leading-tight">AI Workplace</p><p className="text-xs text-muted-foreground">Productivity Assistant</p></div></div>
          <Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></Button>
        </div>
        <nav className="space-y-1.5" aria-label="Main navigation">{nav.map(({ id, label, icon: Icon }) => <Button key={id} variant="ghost" onClick={() => go(id)} className={cn("h-11 w-full justify-start px-3 font-medium", view === id && "bg-sidebar-accent text-primary shadow-sm")}><Icon />{label}</Button>)}</nav>
        <div className="mt-auto border-t border-sidebar-border pt-4">
          <Button variant="ghost" onClick={() => go("settings")} className={cn("h-11 w-full justify-start px-3", view === "settings" && "bg-sidebar-accent text-primary")}><Settings />Settings</Button>
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-sidebar-accent/70 p-3"><div className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">{profile.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{profile.name}</p><p className="truncate text-xs text-muted-foreground">{profile.role}</p></div></div>
        </div>
      </aside>
      <main className="min-h-screen pb-24 lg:ml-64 lg:pb-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur md:px-8 lg:px-10">
          <div className="flex items-center gap-3"><Button className="lg:hidden" variant="outline" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></Button><div><p className="text-xs font-medium uppercase text-muted-foreground">Workspace</p><p className="font-display font-semibold">{nav.find(n=>n.id===view)?.label ?? "Settings"}</p></div></div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="size-4" /><span className="hidden sm:inline">Focused and ready</span><span className="size-2 rounded-full bg-success" /></div>
        </header>
        <div className="mx-auto max-w-7xl p-4 md:p-8 lg:p-10">
          {view === "dashboard" && <Dashboard name={profile.name} saved={saved} go={go} />}
          {view === "email" && <EmailTool save={saveOutput} />}
          {view === "meeting" && <MeetingTool save={saveOutput} />}
          {view === "planner" && <PlannerTool save={saveOutput} />}
          {view === "settings" && <SettingsView profile={profile} setProfile={setProfile} saved={saved} setSaved={setSaved} />}
        </div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card/95 px-2 py-2 backdrop-blur lg:hidden">{nav.map(({id,label,icon:Icon})=><Button key={id} variant="ghost" onClick={()=>go(id)} className={cn("h-14 flex-col gap-1 px-1 text-[11px]",view===id&&"text-primary bg-accent")}><Icon className="size-5" />{label.replace("Smart ","")}</Button>)}</nav>
    </div>
  );
}

function Dashboard({ name, saved, go }: { name: string; saved: SavedItem[]; go: (v: View) => void }) {
  const first = name.split(" ")[0] || "there";
  const features = [
    { id: "email" as View, icon: Mail, title: "Smart Email Generator", text: "Turn a few key points into a polished workplace email.", label: "Write an email" },
    { id: "meeting" as View, icon: FileText, title: "Meeting Notes Summarizer", text: "Transform raw notes into decisions and accountable next steps.", label: "Summarize notes" },
    { id: "planner" as View, icon: CalendarDays, title: "AI Task Planner", text: "Shape priorities into a realistic daily or weekly schedule.", label: "Plan my work" },
  ];
  return <div className="space-y-9 animate-in fade-in duration-500">
    <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="mb-2 text-sm font-semibold text-primary">Thursday, 24 September</p><h1 className="font-display text-3xl font-semibold md:text-4xl">Good morning, {first} 👋</h1><p className="mt-3 max-w-xl text-muted-foreground">Your focused workspace for clearer communication, useful meeting notes, and a plan you can actually finish.</p></div><Button onClick={()=>go("planner")} size="lg"><Plus />Plan today</Button></section>
    <section className="grid gap-4 sm:grid-cols-3"><Stat value={saved.length.toString()} label="Saved outputs" note="Stored on this device" /><Stat value="3" label="Tools ready" note="One focused workspace" /><Stat value="100%" label="Private" note="Your work stays local" /></section>
    <section><div className="mb-4 flex items-end justify-between"><div><p className="section-kicker">Your toolkit</p><h2 className="font-display text-2xl font-semibold">What would you like to accomplish?</h2></div></div><div className="grid gap-5 md:grid-cols-3">{features.map(({id,icon:Icon,title,text,label})=><article key={id} className="group flex min-h-64 flex-col rounded-xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-soft"><div className="mb-6 grid size-11 place-items-center rounded-lg bg-accent text-primary"><Icon /></div><h3 className="font-display text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p><Button className="mt-auto justify-between" variant="outline" onClick={()=>go(id)}>{label}<ArrowRight /></Button></article>)}</div></section>
    <section className="grid gap-6 lg:grid-cols-[1.3fr_.7fr]"><div><div className="mb-4"><p className="section-kicker">Recent activity</p><h2 className="font-display text-xl font-semibold">Pick up where you left off</h2></div><div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">{saved.length ? saved.slice(0,4).map((item,i)=><div key={item.id} className={cn("flex items-center gap-4 p-4",i>0&&"border-t border-border")}><div className="grid size-10 place-items-center rounded-lg bg-secondary text-primary"><FileText className="size-4"/></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.title}</p><p className="text-xs text-muted-foreground">{item.type} · {item.date}</p></div><CheckCircle2 className="size-4 text-success" /></div>) : <div className="p-8 text-center"><Clipboard className="mx-auto mb-3 size-6 text-muted-foreground"/><p className="font-medium">No saved work yet</p><p className="mt-1 text-sm text-muted-foreground">Your saved outputs will appear here.</p></div>}</div></div>
      <div><div className="mb-4"><p className="section-kicker">Quick actions</p><h2 className="font-display text-xl font-semibold">Start in one click</h2></div><div className="space-y-2 rounded-xl border border-border bg-card p-3 shadow-card">{features.map(({id,icon:Icon,label})=><Button key={id} variant="ghost" onClick={()=>go(id)} className="h-12 w-full justify-start"><Icon />{label}<ArrowRight className="ml-auto"/></Button>)}</div></div></section>
  </div>;
}
function Stat({value,label,note}:{value:string;label:string;note:string}) { return <div className="rounded-xl border border-border bg-card p-5 shadow-card"><div className="font-display text-3xl font-semibold text-primary">{value}</div><p className="mt-1 text-sm font-semibold">{label}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>; }

function PageIntro({eyebrow,title,text}:{eyebrow:string;title:string;text:string}) { return <div className="mb-7"><p className="section-kicker">{eyebrow}</p><h1 className="font-display text-3xl font-semibold">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{text}</p></div>; }
function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>{children}</label>; }
function Segmented({options,value,setValue}:{options:string[];value:string;setValue:(x:string)=>void}) { return <div className="grid grid-cols-3 gap-1 rounded-lg bg-secondary p-1">{options.map(x=><Button type="button" key={x} variant="ghost" size="sm" onClick={()=>setValue(x)} className={cn("shadow-none",value===x&&"bg-card text-primary shadow-sm")}>{x}</Button>)}</div>; }
function OutputActions({copy,regenerate,save,saved}:{copy:()=>void;regenerate:()=>void;save:()=>void;saved:boolean}) { const [copied,setCopied]=useState(false); const doCopy=()=>{copy();setCopied(true);setTimeout(()=>setCopied(false),1500)}; return <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={doCopy}>{copied?<Check/>:<Copy/>}{copied?"Copied":"Copy"}</Button><Button variant="outline" size="sm" onClick={regenerate}><RefreshCw/>Regenerate</Button><Button size="sm" onClick={save} disabled={saved}><Save/>{saved?"Saved":"Save locally"}</Button></div>; }
function Disclaimer(){return <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">AI-generated content may contain errors or omissions. Review and verify important information before using it.</p>}

function EmailTool({save}:{save:(x:Omit<SavedItem,"id"|"date">)=>void}) {
  const [form,setForm]=useState(emptyEmail); const [result,setResult]=useState<{subject:string;body:string}|null>(null); const [variation,setVariation]=useState(0); const [saved,setSaved]=useState(false); const [error,setError]=useState("");
  const update=(k:keyof EmailForm,v:string)=>setForm(f=>({...f,[k]:v}));
  const generate=()=>{if(!form.purpose.trim()||!form.recipient.trim()||!form.points.trim()){setError("Add the purpose, recipient, and key points to generate your email.");return}setError("");const next=variation+1;setVariation(next);setResult(makeEmail(form,next));setSaved(false)};
  return <><PageIntro eyebrow="Communication studio" title="Smart Email Generator" text="Turn your intent and talking points into a clear professional email, then refine it in place."/><div className="grid gap-6 xl:grid-cols-[.86fr_1.14fr]"><section className="rounded-xl border border-border bg-card p-5 shadow-card md:p-6"><div className="grid gap-5"><Field label="Email purpose"><input maxLength={180} className={fieldClass} value={form.purpose} onChange={e=>update("purpose",e.target.value)} placeholder="e.g. Request approval for the Q4 campaign"/></Field><Field label="Recipient or audience"><input maxLength={120} className={fieldClass} value={form.recipient} onChange={e=>update("recipient",e.target.value)} placeholder="e.g. Finance leadership team"/></Field><Field label="Key points"><textarea maxLength={2000} className={cn(fieldClass,"min-h-28 resize-y")} value={form.points} onChange={e=>update("points",e.target.value)} placeholder="Add one point per line"/></Field><Field label="Desired outcome"><input maxLength={300} className={fieldClass} value={form.outcome} onChange={e=>update("outcome",e.target.value)} placeholder="What should happen next?"/></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="Tone"><Segmented options={["Formal","Friendly","Persuasive"]} value={form.tone} setValue={v=>update("tone",v)}/></Field><Field label="Length"><Segmented options={["Concise","Standard","Detailed"]} value={form.length} setValue={v=>update("length",v)}/></Field></div>{error&&<p className="text-sm font-medium text-destructive">{error}</p>}<Button size="lg" onClick={generate}><Wand2/>Generate email</Button></div></section>
  <section className="min-h-[580px] rounded-xl border border-border bg-card p-5 shadow-card md:p-6">{result?<div className="flex h-full flex-col"><div className="mb-5 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="section-kicker">Generated draft</p><h2 className="font-display text-xl font-semibold">Ready to review</h2></div><OutputActions copy={()=>navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`)} regenerate={generate} save={()=>{save({type:"Smart Email",title:result.subject,content:result.body});setSaved(true)}} saved={saved}/></div><Field label="Subject"><input className={fieldClass} value={result.subject} onChange={e=>setResult({...result,subject:e.target.value})}/></Field><label className="mt-5 flex flex-1 flex-col"><span className="mb-2 flex items-center gap-2 text-sm font-semibold"><Pencil className="size-4"/>Email body</span><textarea className={cn(fieldClass,"min-h-96 flex-1 resize-y leading-7")} value={result.body} onChange={e=>setResult({...result,body:e.target.value})}/></label><Disclaimer/></div>:<EmptyOutput icon={Mail} title="Your email will appear here" text="Complete the form to create a tailored draft with a subject and editable body."/>}</section></div></>;
}

function MeetingTool({save}:{save:(x:Omit<SavedItem,"id"|"date">)=>void}) { const [notes,setNotes]=useState("");const [result,setResult]=useState("");const [variation,setVariation]=useState(0);const [saved,setSaved]=useState(false);const [error,setError]=useState(""); const generate=()=>{if(notes.trim().length<20){setError("Paste at least a few sentences of meeting notes first.");return}setError("");const n=variation+1;setVariation(n);setResult(analyseNotes(notes,n));setSaved(false)}; return <><PageIntro eyebrow="Meeting intelligence" title="Meeting Notes Summarizer" text="Extract confirmed decisions, owners, deadlines, and follow-ups without filling gaps with assumptions."/><div className="grid gap-6 xl:grid-cols-2"><section className="rounded-xl border border-border bg-card p-5 shadow-card md:p-6"><Field label="Meeting notes"><textarea maxLength={12000} value={notes} onChange={e=>setNotes(e.target.value)} className={cn(fieldClass,"min-h-[470px] resize-y leading-7")} placeholder="Paste your meeting transcript or rough notes here..."/></Field><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>Names, decisions, and dates stay exactly as provided.</span><span>{notes.length.toLocaleString()} / 12,000</span></div>{error&&<p className="mt-3 text-sm font-medium text-destructive">{error}</p>}<Button className="mt-5 w-full" size="lg" onClick={generate}><Wand2/>Summarize meeting</Button></section><section className="min-h-[600px] rounded-xl border border-border bg-card p-5 shadow-card md:p-6">{result?<div><div className="mb-5 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="section-kicker">Structured notes</p><h2 className="font-display text-xl font-semibold">Meeting brief</h2></div><OutputActions copy={()=>navigator.clipboard.writeText(result)} regenerate={generate} save={()=>{save({type:"Meeting Notes",title:"Meeting summary",content:result});setSaved(true)}} saved={saved}/></div><textarea value={result} onChange={e=>setResult(e.target.value)} className={cn(fieldClass,"min-h-[470px] resize-y whitespace-pre-wrap leading-7")}/><Disclaimer/></div>:<EmptyOutput icon={FileText} title="Your meeting brief will appear here" text="Paste notes to identify the discussion, confirmed decisions, action items, deadlines, and missing details."/>}</section></div></> }

function PlannerTool({save}:{save:(x:Omit<SavedItem,"id"|"date">)=>void}) { const [goal,setGoal]=useState("");const [tasks,setTasks]=useState("");const [deadline,setDeadline]=useState("");const [hours,setHours]=useState("8");const [priority,setPriority]=useState("High");const [mode,setMode]=useState("Daily");const [items,setItems]=useState<PlanItem[]>([]);const [variation,setVariation]=useState(0);const [saved,setSaved]=useState(false);const [error,setError]=useState("");const generate=()=>{if(!goal.trim()||!tasks.trim()){setError("Add a goal and at least one task to build your plan.");return}setError("");const n=variation+1;setVariation(n);setItems(buildPlan(tasks,hours,deadline,priority,mode,n));setSaved(false)}; const content=useMemo(()=>`${goal}\n${items.map(i=>`${i.done?"✓":"○"} ${i.time} — ${i.title} (${i.detail})`).join("\n")}`, [goal,items]); return <><PageIntro eyebrow="Planning workspace" title="AI Task Planner" text="Build a grounded schedule around your real priorities, available hours, and stated deadlines."/><div className="grid gap-6 xl:grid-cols-[.82fr_1.18fr]"><section className="rounded-xl border border-border bg-card p-5 shadow-card md:p-6"><div className="grid gap-5"><Field label="Goal"><input maxLength={240} className={fieldClass} value={goal} onChange={e=>setGoal(e.target.value)} placeholder="What do you want to achieve?"/></Field><Field label="Tasks"><textarea maxLength={4000} className={cn(fieldClass,"min-h-36 resize-y")} value={tasks} onChange={e=>setTasks(e.target.value)} placeholder="Add one task per line"/></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Deadline"><input type="date" className={fieldClass} value={deadline} onChange={e=>setDeadline(e.target.value)}/></Field><Field label="Available working hours"><input min="1" max="80" type="number" className={fieldClass} value={hours} onChange={e=>setHours(e.target.value)}/></Field></div><Field label="Priority"><Segmented options={["High","Medium","Low"]} value={priority} setValue={setPriority}/></Field><Field label="Planning view"><div className="grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">{["Daily","Weekly"].map(x=><Button key={x} type="button" variant="ghost" onClick={()=>setMode(x)} className={cn(mode===x&&"bg-card text-primary shadow-sm")}>{x}</Button>)}</div></Field>{error&&<p className="text-sm font-medium text-destructive">{error}</p>}<Button size="lg" onClick={generate}><Wand2/>Build my plan</Button></div></section><section className="min-h-[610px] rounded-xl border border-border bg-card p-5 shadow-card md:p-6">{items.length?<div><div className="mb-5 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="section-kicker">{mode} schedule</p><h2 className="font-display text-xl font-semibold">{goal}</h2></div><OutputActions copy={()=>navigator.clipboard.writeText(content)} regenerate={generate} save={()=>{save({type:"Task Plan",title:goal,content});setSaved(true)}} saved={saved}/></div><div className="space-y-3">{items.map((item,index)=><div key={item.id} className={cn("flex gap-3 rounded-lg border border-border p-4 transition",item.done&&"bg-muted/60 opacity-70")}><Button size="icon" variant={item.done?"default":"outline"} className="mt-0.5 size-8 shrink-0" onClick={()=>setItems(all=>all.map(x=>x.id===item.id?{...x,done:!x.done}:x))} aria-label={item.done?"Mark incomplete":"Mark complete"}>{item.done?<Check/>:<span className="size-3 rounded-full border border-current"/>}</Button><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-primary">{item.time}</span>{item.urgent&&<span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold uppercase text-warning">Urgent</span>}</div><input aria-label={`Task ${index+1}`} value={item.title} onChange={e=>setItems(all=>all.map(x=>x.id===item.id?{...x,title:e.target.value}:x))} className={cn("w-full bg-transparent text-sm font-semibold outline-none",item.done&&"line-through")}/><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p></div></div>)}</div><div className="mt-5 rounded-lg bg-secondary p-4 text-sm leading-6"><strong>Why this order:</strong> The highest-priority work is placed first, with focused blocks distributed across your {hours || "available"} hours. Only the deadline you provided is used.</div><Disclaimer/></div>:<EmptyOutput icon={Target} title="Your schedule will appear here" text="Add your goal and tasks to create editable time blocks you can complete as you work."/>}</section></div></> }

function EmptyOutput({icon:Icon,title,text}:{icon:typeof Mail;title:string;text:string}) { return <div className="grid min-h-[520px] place-items-center text-center"><div className="max-w-xs"><div className="mx-auto mb-4 grid size-14 place-items-center rounded-xl bg-accent text-primary"><Icon className="size-6"/></div><h2 className="font-display text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div></div> }
function SettingsView({profile,setProfile,saved,setSaved}:{profile:{name:string;role:string};setProfile:(x:{name:string;role:string})=>void;saved:SavedItem[];setSaved:(x:SavedItem[])=>void}) { return <><PageIntro eyebrow="Personal preferences" title="Profile & settings" text="Personalise your local workspace. These details are saved only on this device."/><div className="grid gap-6 lg:grid-cols-2"><section className="rounded-xl border border-border bg-card p-6 shadow-card"><div className="mb-6 flex items-center gap-4"><div className="grid size-12 place-items-center rounded-full bg-secondary text-primary"><UserRound/></div><div><h2 className="font-display text-lg font-semibold">Your profile</h2><p className="text-sm text-muted-foreground">Used for your workspace greeting.</p></div></div><div className="grid gap-5"><Field label="Name"><input className={fieldClass} value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value.slice(0,80)})}/></Field><Field label="Role or team"><input className={fieldClass} value={profile.role} onChange={e=>setProfile({...profile,role:e.target.value.slice(0,100)})}/></Field><div className="flex items-center gap-2 text-sm text-success"><CheckCircle2 className="size-4"/>Changes save automatically</div></div></section><section className="rounded-xl border border-border bg-card p-6 shadow-card"><h2 className="font-display text-lg font-semibold">Local data</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">You have {saved.length} saved {saved.length===1?"output":"outputs"} on this device. Clear them whenever you need a fresh start.</p><Button className="mt-6" variant="outline" onClick={()=>setSaved([])} disabled={!saved.length}>Clear saved outputs</Button></section></div></> }
