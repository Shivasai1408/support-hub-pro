import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Agent, type Article, type Customer, type Message, type Ticket, type TicketPriority, type TicketStatus } from "./demo-data";
import { db, isSupabaseConfigured } from "./supabase-rest";

export type Settings = { autoDraft: boolean; autoClassify: boolean; autoResolveSimple: boolean; tone: string; confidenceThreshold: number; notifyEscalations: boolean; notifyDigest: boolean; notifyCsat: boolean };

type SupportContextValue = { tickets: Ticket[]; customers: Customer[]; agents: Agent[]; articles: Article[]; settings: Settings; user: { name: string; email: string; initials: string } | null; loading: boolean; error: string | null; signIn: (email: string, name?: string) => void; signOut: () => void; refresh: () => Promise<void>; updateTicket: (id: string, patch: Partial<Ticket>) => Promise<void>; addMessage: (id: string, message: Omit<Message, "id" | "at">) => Promise<void>; saveArticle: (article: Article) => Promise<void>; deleteArticle: (id: string) => Promise<void>; updateSettings: (patch: Partial<Settings>) => Promise<void>; getCustomer: (id: string) => Customer | undefined; ticketsForCustomer: (id: string) => Ticket[] };
const SupportContext = createContext<SupportContextValue | null>(null);
const defaultSettings: Settings = { autoDraft: true, autoClassify: true, autoResolveSimple: false, tone: "professional", confidenceThreshold: 80, notifyEscalations: true, notifyDigest: true, notifyCsat: false };

type TicketRow = { id: string; subject: string; customer_id: string; assignee_id: string | null; status: Ticket["status"]; priority: Ticket["priority"]; channel: Ticket["channel"]; tags: string[]; created_at: string; updated_at: string; sentiment: Ticket["sentiment"]; ai_handled: boolean; first_response_mins: number | null; messages: Message[] };
type SettingsRow = { id: string; auto_draft: boolean; auto_classify: boolean; auto_resolve_simple: boolean; tone: string; confidence_threshold: number; notify_escalations: boolean; notify_digest: boolean; notify_csat: boolean };

function fromTicketRow(r: TicketRow): Ticket { return { id: r.id, subject: r.subject, customerId: r.customer_id, assigneeId: r.assignee_id, status: r.status, priority: r.priority, channel: r.channel, tags: r.tags ?? [], createdAt: r.created_at, updatedAt: r.updated_at, sentiment: r.sentiment, aiHandled: r.ai_handled, firstResponseMins: r.first_response_mins, messages: r.messages ?? [] }; }
function fromSettings(r: SettingsRow): Settings { return { autoDraft: r.auto_draft, autoClassify: r.auto_classify, autoResolveSimple: r.auto_resolve_simple, tone: r.tone, confidenceThreshold: r.confidence_threshold, notifyEscalations: r.notify_escalations, notifyDigest: r.notify_digest, notifyCsat: r.notify_csat }; }
function settingsRow(s: Settings) { return { id: "default", auto_draft: s.autoDraft, auto_classify: s.autoClassify, auto_resolve_simple: s.autoResolveSimple, tone: s.tone, confidence_threshold: s.confidenceThreshold, notify_escalations: s.notifyEscalations, notify_digest: s.notifyDigest, notify_csat: s.notifyCsat, updated_at: new Date().toISOString() }; }

export function SupportProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SupportContextValue["user"]>(() => { try { const s = localStorage.getItem("support-hub-user"); return s ? JSON.parse(s) : null; } catch { return null; } });

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const [agentsNow, customersNow, ticketsNow, articlesNow, settingsNow] = await Promise.all([
        db.select<Agent>("agents"),
        db.select<any>("customers"),
        db.select<TicketRow>("tickets", "select=*&order=updated_at.desc"),
        db.select<any>("articles", "select=*&order=updated_at.desc"),
        db.select<SettingsRow>("support_settings", "select=*&id=eq.default"),
      ]);
      setAgents(agentsNow);
      setCustomers(customersNow.map(c => ({ id: c.id, name: c.name, email: c.email, company: c.company, plan: c.plan, location: c.location, since: c.since, lifetimeValue: Number(c.lifetime_value ?? 0), initials: c.initials, csat: Number(c.csat ?? 0) })));
      setTickets(ticketsNow.map(fromTicketRow));
      setArticles(articlesNow.map(a => ({ id: a.id, title: a.title, category: a.category, body: a.body, status: a.status, updatedAt: a.updated_at, views: Number(a.views ?? 0), aiUses: Number(a.ai_uses ?? 0) })));
      if (settingsNow[0]) setSettings(fromSettings(settingsNow[0]));
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load support data."); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const updateTicket = useCallback(async (id: string, patch: Partial<Ticket>) => { const updatedAt = new Date().toISOString(); setTickets(p => p.map(t => t.id === id ? { ...t, ...patch, updatedAt } : t)); if (isSupabaseConfigured()) { const d: Record<string, unknown> = { updated_at: updatedAt }; if (patch.subject !== undefined) d.subject = patch.subject; if (patch.assigneeId !== undefined) d.assignee_id = patch.assigneeId; if (patch.status !== undefined) d.status = patch.status; if (patch.priority !== undefined) d.priority = patch.priority; if (patch.tags !== undefined) d.tags = patch.tags; if (patch.sentiment !== undefined) d.sentiment = patch.sentiment; if (patch.aiHandled !== undefined) d.ai_handled = patch.aiHandled; if (patch.firstResponseMins !== undefined) d.first_response_mins = patch.firstResponseMins; if (patch.messages !== undefined) d.messages = patch.messages; await db.update("tickets", `id=eq.${encodeURIComponent(id)}`, d); } }, []);
  const addMessage = useCallback(async (id: string, message: Omit<Message, "id" | "at">) => { const t = tickets.find(x => x.id === id); if (!t) return; await updateTicket(id, { messages: [...t.messages, { ...message, id: `m-${crypto.randomUUID()}`, at: new Date().toISOString() }] }); }, [tickets, updateTicket]);
  const saveArticle = useCallback(async (a: Article) => { const next = { ...a, updatedAt: new Date().toISOString() }; setArticles(p => p.some(x => x.id === next.id) ? p.map(x => x.id === next.id ? next : x) : [next, ...p]); if (isSupabaseConfigured()) await db.upsert("articles", [{ id: next.id, title: next.title, category: next.category, body: next.body, status: next.status, updated_at: next.updatedAt, views: next.views, ai_uses: next.aiUses }]); }, []);
  const deleteArticle = useCallback(async (id: string) => { setArticles(p => p.filter(a => a.id !== id)); if (isSupabaseConfigured()) await db.remove("articles", `id=eq.${encodeURIComponent(id)}`); }, []);
  const updateSettings = useCallback(async (patch: Partial<Settings>) => { const next = { ...settings, ...patch }; setSettings(next); if (isSupabaseConfigured()) await db.upsert("support_settings", [settingsRow(next)]); }, [settings]);
  const signIn = useCallback((email: string, name?: string) => { const cleanEmail = email.trim(); const cleanName = name?.trim() || cleanEmail.split("@")[0] || "Support Agent"; const initials = cleanName.split(/[\s.@_-]+/).filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join(""); const u = { email: cleanEmail, name: cleanName, initials }; setUser(u); localStorage.setItem("support-hub-user", JSON.stringify(u)); }, []);
  const signOut = useCallback(() => { setUser(null); localStorage.removeItem("support-hub-user"); }, []);
  const value = useMemo<SupportContextValue>(() => ({ tickets, customers, agents, articles, settings, user, loading, error, signIn, signOut, refresh, updateTicket, addMessage, saveArticle, deleteArticle, updateSettings, getCustomer: id => customers.find(c => c.id === id), ticketsForCustomer: id => tickets.filter(t => t.customerId === id) }), [tickets, customers, agents, articles, settings, user, loading, error, signIn, signOut, refresh, updateTicket, addMessage, saveArticle, deleteArticle, updateSettings]);
  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}
export function useSupport() { const ctx = useContext(SupportContext); if (!ctx) throw new Error("useSupport must be used inside SupportProvider"); return ctx; }
export const statusLabels: Record<TicketStatus, string> = { open: "Open", pending: "Pending", resolved: "Resolved", closed: "Closed" };
export const priorityLabels: Record<TicketPriority, string> = { urgent: "Urgent", high: "High", normal: "Normal", low: "Low" };
export function timeAgo(iso: string) { const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000)); if (mins < 60) return `${mins}m ago`; const hours = Math.round(mins / 60); if (hours < 24) return `${hours}h ago`; return `${Math.round(hours / 24)}d ago`; }
