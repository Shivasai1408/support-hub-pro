import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  agents as seedAgents,
  articles as seedArticles,
  customers as seedCustomers,
  tickets as seedTickets,
  type Agent,
  type Article,
  type Customer,
  type Message,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "./demo-data";
import { db, isSupabaseConfigured } from "./supabase-rest";

export type Settings = {
  autoDraft: boolean;
  autoClassify: boolean;
  autoResolveSimple: boolean;
  tone: string;
  confidenceThreshold: number;
  notifyEscalations: boolean;
  notifyDigest: boolean;
  notifyCsat: boolean;
};

type SupportContextValue = {
  tickets: Ticket[];
  customers: Customer[];
  agents: Agent[];
  articles: Article[];
  settings: Settings;
  user: { name: string; email: string; initials: string } | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
  refresh: () => Promise<void>;
  updateTicket: (id: string, patch: Partial<Ticket>) => Promise<void>;
  addMessage: (id: string, message: Omit<Message, "id" | "at">) => Promise<void>;
  saveArticle: (article: Article) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  getCustomer: (id: string) => Customer | undefined;
  ticketsForCustomer: (id: string) => Ticket[];
};

const SupportContext = createContext<SupportContextValue | null>(null);

const defaultSettings: Settings = {
  autoDraft: true,
  autoClassify: true,
  autoResolveSimple: false,
  tone: "professional",
  confidenceThreshold: 80,
  notifyEscalations: true,
  notifyDigest: true,
  notifyCsat: false,
};

type TicketRow = Omit<Ticket, "customerId" | "assigneeId" | "createdAt" | "updatedAt" | "firstResponseMins" | "aiHandled"> & {
  customer_id: string;
  assignee_id: string | null;
  created_at: string;
  updated_at: string;
  first_response_mins: number | null;
  ai_handled: boolean;
};

type SettingsRow = {
  id: string;
  auto_draft: boolean;
  auto_classify: boolean;
  auto_resolve_simple: boolean;
  tone: string;
  confidence_threshold: number;
  notify_escalations: boolean;
  notify_digest: boolean;
  notify_csat: boolean;
};

function fromTicketRow(row: TicketRow): Ticket {
  return {
    id: row.id,
    subject: row.subject,
    customerId: row.customer_id,
    assigneeId: row.assignee_id,
    status: row.status,
    priority: row.priority,
    channel: row.channel,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sentiment: row.sentiment,
    aiHandled: row.ai_handled,
    firstResponseMins: row.first_response_mins,
    messages: row.messages ?? [],
  };
}

function toTicketRow(ticket: Ticket): TicketRow {
  return {
    id: ticket.id,
    subject: ticket.subject,
    customer_id: ticket.customerId,
    assignee_id: ticket.assigneeId,
    status: ticket.status,
    priority: ticket.priority,
    channel: ticket.channel,
    tags: ticket.tags,
    created_at: ticket.createdAt,
    updated_at: ticket.updatedAt,
    sentiment: ticket.sentiment,
    ai_handled: ticket.aiHandled,
    first_response_mins: ticket.firstResponseMins,
    messages: ticket.messages,
  };
}

function fromSettings(row: SettingsRow): Settings {
  return {
    autoDraft: row.auto_draft,
    autoClassify: row.auto_classify,
    autoResolveSimple: row.auto_resolve_simple,
    tone: row.tone,
    confidenceThreshold: row.confidence_threshold,
    notifyEscalations: row.notify_escalations,
    notifyDigest: row.notify_digest,
    notifyCsat: row.notify_csat,
  };
}

function toSettings(patch: Partial<Settings>) {
  return {
    ...(patch.autoDraft === undefined ? {} : { auto_draft: patch.autoDraft }),
    ...(patch.autoClassify === undefined ? {} : { auto_classify: patch.autoClassify }),
    ...(patch.autoResolveSimple === undefined ? {} : { auto_resolve_simple: patch.autoResolveSimple }),
    ...(patch.tone === undefined ? {} : { tone: patch.tone }),
    ...(patch.confidenceThreshold === undefined ? {} : { confidence_threshold: patch.confidenceThreshold }),
    ...(patch.notifyEscalations === undefined ? {} : { notify_escalations: patch.notifyEscalations }),
    ...(patch.notifyDigest === undefined ? {} : { notify_digest: patch.notifyDigest }),
    ...(patch.notifyCsat === undefined ? {} : { notify_csat: patch.notifyCsat }),
    updated_at: new Date().toISOString(),
  };
}

export function SupportProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [agents, setAgents] = useState<Agent[]>(seedAgents);
  const [articles, setArticles] = useState<Article[]>(seedArticles);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SupportContextValue["user"]>(() => {
    try {
      const saved = localStorage.getItem("support-hub-user");
      return saved ? JSON.parse(saved) : { name: "Maya Okonkwo", email: "maya@helm.support", initials: "MO" };
    } catch {
      return { name: "Maya Okonkwo", email: "maya@helm.support", initials: "MO" };
    }
  });

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    setError(null);
    try {
      const [agentRows, customerRows, ticketRows, articleRows, settingRows] = await Promise.all([
        db.select<Agent>("agents"),
        db.select<Customer>("customers"),
        db.select<TicketRow>("tickets", "select=*&order=updated_at.desc"),
        db.select<Article>("articles", "select=*&order=updated_at.desc"),
        db.select<SettingsRow>("support_settings", "select=*&id=eq.default"),
      ]);

      if (!agentRows.length) await db.upsert("agents", seedAgents);
      if (!customerRows.length) await db.upsert("customers", seedCustomers.map((c) => ({ ...c, lifetime_value: c.lifetimeValue })));
      if (!ticketRows.length) await db.upsert("tickets", seedTickets.map(toTicketRow));
      if (!articleRows.length) await db.upsert("articles", seedArticles.map((a) => ({ ...a, updated_at: a.updatedAt, ai_uses: a.aiUses })));
      if (!settingRows.length) await db.upsert("support_settings", [{ id: "default", ...toSettings(defaultSettings) }]);

      const [freshAgents, freshCustomers, freshTickets, freshArticles, freshSettings] = await Promise.all([
        db.select<Agent>("agents"),
        db.select<ArrayElement<typeof seedCustomers>>("customers"),
        db.select<TicketRow>("tickets", "select=*&order=updated_at.desc"),
        db.select<Article>("articles", "select=*&order=updated_at.desc"),
        db.select<SettingsRow>("support_settings", "select=*&id=eq.default"),
      ]);

      setAgents(freshAgents.map((a) => ({ ...a })));
      setCustomers(freshCustomers.map((c: any) => ({ ...c, lifetimeValue: Number(c.lifetime_value ?? c.lifetimeValue ?? 0) })));
      setTickets(freshTickets.map(fromTicketRow));
      setArticles(freshArticles.map((a: any) => ({ ...a, updatedAt: a.updated_at ?? a.updatedAt, aiUses: Number(a.ai_uses ?? a.aiUses ?? 0) })));
      if (freshSettings[0]) setSettings(fromSettings(freshSettings[0]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load support data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const updateTicket = useCallback(async (id: string, patch: Partial<Ticket>) => {
    const updatedAt = new Date().toISOString();
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, ...patch, updatedAt } : t));
    if (isSupabaseConfigured()) {
      const dbPatch: Record<string, unknown> = { updated_at: updatedAt };
      if (patch.subject !== undefined) dbPatch.subject = patch.subject;
      if (patch.assigneeId !== undefined) dbPatch.assignee_id = patch.assigneeId;
      if (patch.status !== undefined) dbPatch.status = patch.status;
      if (patch.priority !== undefined) dbPatch.priority = patch.priority;
      if (patch.tags !== undefined) dbPatch.tags = patch.tags;
      if (patch.sentiment !== undefined) dbPatch.sentiment = patch.sentiment;
      if (patch.aiHandled !== undefined) dbPatch.ai_handled = patch.aiHandled;
      if (patch.firstResponseMins !== undefined) dbPatch.first_response_mins = patch.firstResponseMins;
      if (patch.messages !== undefined) dbPatch.messages = patch.messages;
      await db.update("tickets", `id=eq.${encodeURIComponent(id)}`, dbPatch);
    }
  }, []);

  const addMessage = useCallback(async (id: string, message: Omit<Message, "id" | "at">) => {
    const now = new Date().toISOString();
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return;
    const nextMessages = [...ticket.messages, { ...message, id: `m-${crypto.randomUUID()}`, at: now }];
    await updateTicket(id, { messages: nextMessages });
  }, [tickets, updateTicket]);

  const saveArticle = useCallback(async (article: Article) => {
    const next = { ...article, updatedAt: new Date().toISOString() };
    setArticles((prev) => prev.some((a) => a.id === next.id) ? prev.map((a) => a.id === next.id ? next : a) : [next, ...prev]);
    if (isSupabaseConfigured()) {
      await db.upsert("articles", [{ id: next.id, title: next.title, category: next.category, body: next.body, status: next.status, updated_at: next.updatedAt, views: next.views, ai_uses: next.aiUses }]);
    }
  }, []);

  const deleteArticle = useCallback(async (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    if (isSupabaseConfigured()) await db.remove("articles", `id=eq.${encodeURIComponent(id)}`);
  }, []);

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
    if (isSupabaseConfigured()) await db.update("support_settings", "id=eq.default", toSettings(patch));
  }, []);

  const signIn = useCallback((email: string, name?: string) => {
    const resolvedName = name?.trim() || "Maya Okonkwo";
    const next = { email, name: resolvedName, initials: (name?.trim() || email).split(/[\s.@]/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") };
    setUser(next);
    localStorage.setItem("support-hub-user", JSON.stringify(next));
  }, []);

  const signOut = useCallback(() => { setUser(null); localStorage.removeItem("support-hub-user"); }, []);

  const value = useMemo<SupportContextValue>(() => ({
    tickets, customers, agents, articles, settings, user, loading, error,
    signIn, signOut, refresh, updateTicket, addMessage, saveArticle, deleteArticle, updateSettings,
    getCustomer: (id) => customers.find((c) => c.id === id),
    ticketsForCustomer: (id) => tickets.filter((t) => t.customerId === id),
  }), [tickets, customers, agents, articles, settings, user, loading, error, signIn, signOut, refresh, updateTicket, addMessage, saveArticle, deleteArticle, updateSettings]);

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}

export function useSupport() {
  const ctx = useContext(SupportContext);
  if (!ctx) throw new Error("useSupport must be used inside SupportProvider");
  return ctx;
}

export const statusLabels: Record<TicketStatus, string> = { open: "Open", pending: "Pending", resolved: "Resolved", closed: "Closed" };
export const priorityLabels: Record<TicketPriority, string> = { urgent: "Urgent", high: "High", normal: "Normal", low: "Low" };

export function timeAgo(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;
