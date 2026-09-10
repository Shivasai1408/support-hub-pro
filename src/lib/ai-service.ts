/**
 * AI service boundary.
 *
 * The app talks only to `aiService`. Today it is backed by `mockAiProvider`,
 * which produces deterministic, realistic output with simulated latency.
 * To connect a real model later, implement `AiProvider` against a server
 * function / API route and swap the provider passed to `createAiService`.
 */
import type { Sentiment, Ticket, TicketPriority } from "./demo-data";

export type DraftReplyResult = { text: string; usedArticles: string[]; tone: string };
export type SummaryResult = { summary: string; bullets: string[] };
export type SentimentResult = { sentiment: Sentiment; score: number; rationale: string };
export type NextActionsResult = { actions: string[] };
export type ClassificationResult = {
  category: string;
  priority: TicketPriority;
  team: string;
  tags: string[];
  confidence: number;
};

export type AiProvider = {
  draftReply(ticket: Ticket, tone: string): Promise<DraftReplyResult>;
  summarize(ticket: Ticket): Promise<SummaryResult>;
  analyzeSentiment(ticket: Ticket): Promise<SentimentResult>;
  suggestNextActions(ticket: Ticket): Promise<NextActionsResult>;
  classify(ticket: Ticket): Promise<ClassificationResult>;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const lastCustomerMessage = (ticket: Ticket) =>
  [...ticket.messages].reverse().find((m) => m.author === "customer")?.body ?? ticket.subject;

const topicOf = (ticket: Ticket) => {
  const text = `${ticket.subject} ${ticket.tags.join(" ")}`.toLowerCase();
  if (text.includes("billing") || text.includes("invoice") || text.includes("refund")) return "billing";
  if (text.includes("sso") || text.includes("auth") || text.includes("login")) return "auth";
  if (text.includes("api") || text.includes("webhook") || text.includes("limit")) return "api";
  if (text.includes("seat") || text.includes("invite")) return "seats";
  if (text.includes("feature")) return "feature";
  return "general";
};

const draftsByTopic: Record<string, { body: string; articles: string[]; category: string; team: string }> = {
  billing: {
    body: "I've confirmed the duplicate charge on your account and submitted a refund for the later transaction — you'll see the credit back on the original card within 5–7 business days, and I'll send the refund reference as soon as it clears.\n\nTo stop this repeating, I've switched the invoice to a single retry window so a failed payment can no longer be captured twice in the same cycle.\n\nIs there anything else your finance team needs for reconciliation?",
    articles: ["Duplicate charge troubleshooting for finance teams", "Seat limits, invites and plan upgrades"],
    category: "Billing",
    team: "Billing",
  },
  auth: {
    body: "Thanks for the details — this pattern almost always means the stored SAML metadata is still pointing at the previous signing certificate.\n\nCould you download the fresh metadata XML from Okta and re-upload it under Settings → SSO, then confirm the entity ID is unchanged? After that, clearing active sessions will let the affected users sign in cleanly.\n\nI'll keep this ticket open until you confirm all 40 users are back in.",
    articles: ["Re-uploading SAML metadata after certificate rotation"],
    category: "Authentication",
    team: "Technical Support",
  },
  api: {
    body: "The 429s you're seeing come from the per-endpoint burst ceiling rather than your account-level limit, which is why the sync fails partway through rather than immediately.\n\nTwo things will fix it: add exponential backoff on 429 responses, and let me raise the burst window for your sync job. If you send me the start time and duration, I'll schedule the increase for tonight's run.",
    articles: ["Understanding API rate limits and burst windows", "Fixing webhook signature verification errors"],
    category: "Developers",
    team: "Technical Support",
  },
  seats: {
    body: "Sorry for the wait on this one. Free workspaces include three seats, and pending invites hold a seat until they're accepted or revoked — that's what's triggering the limit message.\n\nRevoking any unaccepted invites will free the seats immediately, or upgrading under Settings → Billing adds seats instantly with prorated billing. Happy to apply the upgrade for you if you'd like.",
    articles: ["Seat limits, invites and plan upgrades"],
    category: "Billing",
    team: "Onboarding",
  },
  feature: {
    body: "Thank you for the suggestion — the dark-room presentation use case is a genuinely useful detail, and I've attached it to the existing request with our product team.\n\nI can't promise a date yet, but I've subscribed you to the request so you'll hear from us the moment it's scheduled.",
    articles: [],
    category: "Product Feedback",
    team: "Product",
  },
  general: {
    body: "Thanks for reaching out — I've reviewed the thread and have what I need to move this forward.\n\nHere's what I'd suggest as the next step, and I'll stay on this ticket until it's fully resolved. If anything I've described doesn't match what you're seeing, a screenshot would help me narrow it down quickly.",
    articles: [],
    category: "General",
    team: "Support",
  },
};

const toneWrap = (body: string, tone: string) => {
  if (tone === "concise") {
    return body
      .split("\n\n")
      .slice(0, 2)
      .map((p) => p.split(". ").slice(0, 2).join(". "))
      .join("\n\n");
  }
  if (tone === "empathetic") {
    return `I completely understand how disruptive this is, and I'm sorry you've had to chase it.\n\n${body}`;
  }
  if (tone === "technical") {
    return `${body}\n\nTechnical detail: I've attached the relevant request IDs and configuration diff to this ticket for your engineers.`;
  }
  return body;
};

export const mockAiProvider: AiProvider = {
  async draftReply(ticket, tone) {
    await wait(900);
    const t = draftsByTopic[topicOf(ticket)];
    const customer = ticket.messages.find((m) => m.author === "customer")?.authorName.split(" ")[0] ?? "there";
    return {
      text: `Hi ${customer},\n\n${toneWrap(t.body, tone)}\n\nBest regards,\nHelm Support`,
      usedArticles: t.articles,
      tone,
    };
  },

  async summarize(ticket) {
    await wait(750);
    const turns = ticket.messages.length;
    const t = topicOf(ticket);
    const headline: Record<string, string> = {
      billing: "A duplicate charge on a recent invoice needs a refund and a reference number for finance.",
      auth: "SSO users are stuck in a login loop after an identity-provider certificate rotation.",
      api: "A nightly sync is failing with rate-limit errors partway through the job.",
      seats: "A new workspace cannot invite teammates because pending invites consume seats.",
      feature: "A customer requested a dark theme for shared dashboards, with a clear use case.",
      general: "The customer reported an issue and is waiting on a next step.",
    };
    return {
      summary: `${headline[t]} ${turns} messages exchanged; the customer's latest message asks for confirmation and a concrete next step.`,
      bullets: [
        `Reported via ${ticket.channel} · priority ${ticket.priority}`,
        `${turns} messages, last customer note: "${lastCustomerMessage(ticket).slice(0, 90)}…"`,
        ticket.assigneeId ? "Owner assigned and actively responding" : "No owner assigned yet — needs routing",
        `Detected sentiment: ${ticket.sentiment}`,
      ],
    };
  },

  async analyzeSentiment(ticket) {
    await wait(500);
    const text = lastCustomerMessage(ticket).toLowerCase();
    const negative = ["second time", "nobody has replied", "failing", "still", "unacceptable", "frustrat", "worse"];
    const positive = ["thanks", "appreciate", "lovely", "great", "quick"];
    let score = 0;
    negative.forEach((w) => text.includes(w) && (score -= 1));
    positive.forEach((w) => text.includes(w) && (score += 1));
    const sentiment: Sentiment = score > 0 ? "positive" : score < 0 ? "negative" : "neutral";
    return {
      sentiment,
      score: Math.max(-1, Math.min(1, score / 2)),
      rationale:
        sentiment === "negative"
          ? "Repetition and escalation language suggest eroding patience — prioritise a same-day reply."
          : sentiment === "positive"
            ? "Appreciative language and low urgency; a clear answer should close this happily."
            : "Factual, information-seeking tone with no strong emotional signal.",
    };
  },

  async suggestNextActions(ticket) {
    await wait(600);
    const t = topicOf(ticket);
    const base: Record<string, string[]> = {
      billing: [
        "Issue the refund for the duplicate charge and capture the reference",
        "Attach the refund reference to invoice #INV-8841",
        "Enable single retry window to prevent recurrence",
        "Follow up with finance contact within 24 hours",
      ],
      auth: [
        "Ask the customer to re-upload fresh IdP metadata",
        "Verify entity ID matches the stored configuration",
        "Clear active sessions for affected users",
        "Share the SAML rotation article",
      ],
      api: [
        "Raise the per-endpoint burst window for the sync job",
        "Recommend exponential backoff on 429 responses",
        "Confirm sync start time and duration",
        "Add customer to rate-limit change notifications",
      ],
      seats: [
        "Revoke unaccepted invites to release seats",
        "Offer plan upgrade with prorated billing",
        "Assign to onboarding queue",
        "Send seat-limit article",
      ],
      feature: [
        "Log the request against the dark-mode roadmap item",
        "Subscribe customer to status updates",
        "Set ticket to pending product review",
      ],
      general: ["Reply with the recommended next step", "Request a screenshot or request ID", "Set a follow-up reminder"],
    };
    const actions = [...base[t]];
    if (!ticket.assigneeId) actions.unshift("Assign an owner — this ticket is unrouted");
    if (ticket.priority === "urgent") actions.push("Notify the support lead in #escalations");
    return { actions };
  },

  async classify(ticket) {
    await wait(700);
    const t = topicOf(ticket);
    const meta = draftsByTopic[t];
    const priority: TicketPriority =
      t === "billing" ? "urgent" : t === "auth" || t === "api" ? "high" : t === "feature" ? "low" : "normal";
    const tags: Record<string, string[]> = {
      billing: ["billing", "refund", "invoice"],
      auth: ["sso", "auth", "outage-risk"],
      api: ["api", "limits"],
      seats: ["seats", "onboarding"],
      feature: ["feature-request"],
      general: ["triage"],
    };
    return {
      category: meta.category,
      priority,
      team: meta.team,
      tags: tags[t],
      confidence: t === "general" ? 0.62 : 0.87 + Math.min(0.1, ticket.messages.length * 0.01),
    };
  },
};

export const createAiService = (provider: AiProvider) => provider;

export const aiService = createAiService(mockAiProvider);
