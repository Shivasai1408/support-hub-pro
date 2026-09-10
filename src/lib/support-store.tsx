import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
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
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
  updateTicket: (id: string, patch: Partial<Ticket>) => void;
  addMessage: (id: string, message: Omit<Message, "id" | "at">) => void;
  saveArticle: (article: Article) => void;
  deleteArticle: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
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

export function SupportProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [articles, setArticles] = useState<Article[]>(seedArticles);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [user, setUser] = useState<SupportContextValue["user"]>({
    name: "Maya Okonkwo",
    email: "maya@helm.support",
    initials: "MO",
  });

  const updateTicket = useCallback((id: string, patch: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)),
    );
  }, []);

  const addMessage = useCallback((id: string, message: Omit<Message, "id" | "at">) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              updatedAt: new Date().toISOString(),
              messages: [
                ...t.messages,
                { ...message, id: `m${t.messages.length + 1}-${Date.now()}`, at: new Date().toISOString() },
              ],
            }
          : t,
      ),
    );
  }, []);

  const saveArticle = useCallback((article: Article) => {
    setArticles((prev) => {
      const exists = prev.some((a) => a.id === article.id);
      return exists ? prev.map((a) => (a.id === article.id ? article : a)) : [article, ...prev];
    });
  }, []);

  const deleteArticle = useCallback((id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo<SupportContextValue>(
    () => ({
      tickets,
      customers: seedCustomers,
      agents: seedAgents,
      articles,
      settings,
      user,
      signIn: (email, name) =>
        setUser({
          email,
          name: name?.trim() || "Maya Okonkwo",
          initials: (name?.trim() || email)
            .split(/[\s.@]/)
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]!.toUpperCase())
            .join(""),
        }),
      signOut: () => setUser(null),
      updateTicket,
      addMessage,
      saveArticle,
      deleteArticle,
      updateSettings: (patch) => setSettings((s) => ({ ...s, ...patch })),
      getCustomer: (id) => seedCustomers.find((c) => c.id === id),
      ticketsForCustomer: (id) => tickets.filter((t) => t.customerId === id),
    }),
    [tickets, articles, settings, user, updateTicket, addMessage, saveArticle, deleteArticle],
  );

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}

export function useSupport() {
  const ctx = useContext(SupportContext);
  if (!ctx) throw new Error("useSupport must be used inside SupportProvider");
  return ctx;
}

export const statusLabels: Record<TicketStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

export const priorityLabels: Record<TicketPriority, string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
};

export function timeAgo(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
