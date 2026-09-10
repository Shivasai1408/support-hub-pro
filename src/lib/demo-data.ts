export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "urgent" | "high" | "normal" | "low";
export type TicketChannel = "email" | "chat" | "phone" | "social";
export type Sentiment = "positive" | "neutral" | "negative";

export type Agent = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Support Lead" | "Agent";
  initials: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: "Free" | "Pro" | "Business" | "Enterprise";
  location: string;
  since: string;
  lifetimeValue: number;
  initials: string;
  csat: number;
};

export type Message = {
  id: string;
  author: "customer" | "agent" | "ai";
  authorName: string;
  body: string;
  at: string;
  internal?: boolean;
};

export type Ticket = {
  id: string;
  subject: string;
  customerId: string;
  assigneeId: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  sentiment: Sentiment;
  aiHandled: boolean;
  firstResponseMins: number | null;
  messages: Message[];
};

export type Article = {
  id: string;
  title: string;
  category: string;
  body: string;
  status: "published" | "draft";
  updatedAt: string;
  views: number;
  aiUses: number;
};

export const agents: Agent[] = [
  { id: "a1", name: "Maya Okonkwo", email: "maya@helm.support", role: "Support Lead", initials: "MO" },
  { id: "a2", name: "Diego Ramirez", email: "diego@helm.support", role: "Agent", initials: "DR" },
  { id: "a3", name: "Priya Nair", email: "priya@helm.support", role: "Agent", initials: "PN" },
  { id: "a4", name: "Tom Lindqvist", email: "tom@helm.support", role: "Admin", initials: "TL" },
];

export const customers: Customer[] = [
  {
    id: "c1",
    name: "Elena Fischer",
    email: "elena.fischer@northwind.io",
    company: "Northwind Analytics",
    plan: "Enterprise",
    location: "Berlin, DE",
    since: "2023-02-11",
    lifetimeValue: 48200,
    initials: "EF",
    csat: 4.6,
  },
  {
    id: "c2",
    name: "Marcus Boyd",
    email: "m.boyd@brightloop.com",
    company: "Brightloop",
    plan: "Business",
    location: "Austin, US",
    since: "2024-05-02",
    lifetimeValue: 12400,
    initials: "MB",
    csat: 3.9,
  },
  {
    id: "c3",
    name: "Sara Haddad",
    email: "sara@quillbase.co",
    company: "Quillbase",
    plan: "Pro",
    location: "Toronto, CA",
    since: "2025-01-19",
    lifetimeValue: 3600,
    initials: "SH",
    csat: 4.9,
  },
  {
    id: "c4",
    name: "Jonas Petit",
    email: "jonas.petit@fleetly.fr",
    company: "Fleetly",
    plan: "Business",
    location: "Lyon, FR",
    since: "2024-09-08",
    lifetimeValue: 18750,
    initials: "JP",
    csat: 4.2,
  },
  {
    id: "c5",
    name: "Aiko Tanaka",
    email: "aiko@studiomori.jp",
    company: "Studio Mori",
    plan: "Pro",
    location: "Osaka, JP",
    since: "2025-06-30",
    lifetimeValue: 2900,
    initials: "AT",
    csat: 4.4,
  },
  {
    id: "c6",
    name: "Ryan Osei",
    email: "ryan@paceworks.dev",
    company: "Paceworks",
    plan: "Free",
    location: "Manchester, UK",
    since: "2026-03-14",
    lifetimeValue: 0,
    initials: "RO",
    csat: 3.4,
  },
];

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export const tickets: Ticket[] = [
  {
    id: "T-2041",
    subject: "Billing charged twice for August invoice",
    customerId: "c1",
    assigneeId: "a1",
    status: "open",
    priority: "urgent",
    channel: "email",
    tags: ["billing", "invoice"],
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(1),
    sentiment: "negative",
    aiHandled: false,
    firstResponseMins: 24,
    messages: [
      {
        id: "m1",
        author: "customer",
        authorName: "Elena Fischer",
        at: hoursAgo(5),
        body: "We were charged twice for invoice #INV-8841 in August. Our finance team needs this refunded before month end, this is the second time it has happened.",
      },
      {
        id: "m2",
        author: "agent",
        authorName: "Maya Okonkwo",
        at: hoursAgo(4),
        body: "Hi Elena, thanks for flagging this. I can see two successful charges on the same invoice and I've escalated to billing for a refund.",
      },
      {
        id: "m3",
        author: "customer",
        authorName: "Elena Fischer",
        at: hoursAgo(1),
        body: "Appreciate the quick reply. Can you confirm the refund reference and how you'll prevent the duplicate next cycle?",
      },
    ],
  },
  {
    id: "T-2040",
    subject: "SSO login loop after Okta metadata update",
    customerId: "c4",
    assigneeId: "a2",
    status: "pending",
    priority: "high",
    channel: "chat",
    tags: ["sso", "auth"],
    createdAt: hoursAgo(9),
    updatedAt: hoursAgo(2),
    sentiment: "neutral",
    aiHandled: false,
    firstResponseMins: 8,
    messages: [
      {
        id: "m1",
        author: "customer",
        authorName: "Jonas Petit",
        at: hoursAgo(9),
        body: "After rotating our Okta certificate, users get bounced back to the login screen repeatedly. Around 40 people affected.",
      },
      {
        id: "m2",
        author: "ai",
        authorName: "Helm AI",
        at: hoursAgo(9),
        body: "Suggested article shared automatically: “Re-uploading SAML metadata after certificate rotation”.",
      },
      {
        id: "m3",
        author: "agent",
        authorName: "Diego Ramirez",
        at: hoursAgo(2),
        body: "Could you re-upload the new metadata XML in Settings → SSO and confirm the entity ID matches? I'll stay on the thread.",
      },
    ],
  },
  {
    id: "T-2039",
    subject: "How do I export a report as CSV?",
    customerId: "c3",
    assigneeId: null,
    status: "open",
    priority: "low",
    channel: "chat",
    tags: ["how-to", "reporting"],
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
    sentiment: "positive",
    aiHandled: true,
    firstResponseMins: 1,
    messages: [
      {
        id: "m1",
        author: "customer",
        authorName: "Sara Haddad",
        at: hoursAgo(3),
        body: "Quick one — where's the CSV export on the reports page? I only see PDF.",
      },
      {
        id: "m2",
        author: "ai",
        authorName: "Helm AI",
        at: hoursAgo(3),
        body: "Open any report, click the ⋯ menu in the top-right and choose Export → CSV. Exports over 50k rows are emailed to you instead.",
      },
    ],
  },
  {
    id: "T-2038",
    subject: "API rate limit hit during nightly sync",
    customerId: "c2",
    assigneeId: "a3",
    status: "open",
    priority: "high",
    channel: "email",
    tags: ["api", "limits"],
    createdAt: hoursAgo(20),
    updatedAt: hoursAgo(6),
    sentiment: "negative",
    aiHandled: false,
    firstResponseMins: 41,
    messages: [
      {
        id: "m1",
        author: "customer",
        authorName: "Marcus Boyd",
        at: hoursAgo(20),
        body: "Our nightly sync is failing with 429s halfway through. We're on Business, I thought the limit was 10k/min?",
      },
      {
        id: "m2",
        author: "agent",
        authorName: "Priya Nair",
        at: hoursAgo(6),
        body: "You're hitting the per-endpoint burst ceiling rather than the account limit. I can raise the burst window — can you share the sync start time?",
      },
    ],
  },
  {
    id: "T-2037",
    subject: "Feature request: dark mode for shared dashboards",
    customerId: "c5",
    assigneeId: "a3",
    status: "pending",
    priority: "low",
    channel: "social",
    tags: ["feature-request"],
    createdAt: hoursAgo(30),
    updatedAt: hoursAgo(26),
    sentiment: "positive",
    aiHandled: false,
    firstResponseMins: 55,
    messages: [
      {
        id: "m1",
        author: "customer",
        authorName: "Aiko Tanaka",
        at: hoursAgo(30),
        body: "Our studio presents dashboards in dark rooms — a dark theme for shared links would be lovely.",
      },
      {
        id: "m2",
        author: "agent",
        authorName: "Priya Nair",
        at: hoursAgo(26),
        body: "Passed this to product with your use case attached. I'll ping you when it's on the roadmap.",
      },
    ],
  },
  {
    id: "T-2036",
    subject: "Cannot invite teammates — seat limit error",
    customerId: "c6",
    assigneeId: null,
    status: "open",
    priority: "normal",
    channel: "email",
    tags: ["seats", "onboarding"],
    createdAt: hoursAgo(12),
    updatedAt: hoursAgo(12),
    sentiment: "negative",
    aiHandled: false,
    firstResponseMins: null,
    messages: [
      {
        id: "m1",
        author: "customer",
        authorName: "Ryan Osei",
        at: hoursAgo(12),
        body: "Trying to add two teammates and I get “seat limit reached”. We just signed up today and nobody has replied yet.",
      },
    ],
  },
  {
    id: "T-2035",
    subject: "Webhook signature verification failing",
    customerId: "c2",
    assigneeId: "a2",
    status: "resolved",
    priority: "normal",
    channel: "email",
    tags: ["webhooks", "api"],
    createdAt: hoursAgo(52),
    updatedAt: hoursAgo(40),
    sentiment: "neutral",
    aiHandled: true,
    firstResponseMins: 12,
    messages: [
      {
        id: "m1",
        author: "customer",
        authorName: "Marcus Boyd",
        at: hoursAgo(52),
        body: "Signature check fails on every webhook since Friday.",
      },
      {
        id: "m2",
        author: "ai",
        authorName: "Helm AI",
        at: hoursAgo(52),
        body: "Most common cause: verifying against the parsed JSON body instead of the raw request body. Use the raw string before parsing.",
      },
      {
        id: "m3",
        author: "customer",
        authorName: "Marcus Boyd",
        at: hoursAgo(41),
        body: "That was it. Thanks!",
      },
    ],
  },
  {
    id: "T-2034",
    subject: "Refund request for unused seats",
    customerId: "c1",
    assigneeId: "a1",
    status: "closed",
    priority: "normal",
    channel: "phone",
    tags: ["billing", "refund"],
    createdAt: hoursAgo(96),
    updatedAt: hoursAgo(70),
    sentiment: "positive",
    aiHandled: false,
    firstResponseMins: 15,
    messages: [
      {
        id: "m1",
        author: "customer",
        authorName: "Elena Fischer",
        at: hoursAgo(96),
        body: "We downsized from 200 to 160 seats mid-cycle and would like the difference credited.",
      },
      {
        id: "m2",
        author: "agent",
        authorName: "Maya Okonkwo",
        at: hoursAgo(70),
        body: "Credit of €2,140 applied to your next invoice. Closing this out — shout if anything looks off.",
      },
    ],
  },
];

export const articles: Article[] = [
  {
    id: "kb1",
    title: "Re-uploading SAML metadata after certificate rotation",
    category: "Authentication",
    status: "published",
    updatedAt: hoursAgo(72),
    views: 3182,
    aiUses: 214,
    body: "When your identity provider rotates its signing certificate, the stored metadata becomes stale and users are bounced back to the login screen. Download the fresh metadata XML from your IdP, then upload it under Settings → SSO. Confirm the entity ID is unchanged and clear active sessions.",
  },
  {
    id: "kb2",
    title: "Understanding API rate limits and burst windows",
    category: "Developers",
    status: "published",
    updatedAt: hoursAgo(120),
    views: 5410,
    aiUses: 388,
    body: "Account limits apply per minute across all endpoints, while burst ceilings apply per endpoint over a 10-second window. Batch nightly syncs, add exponential backoff on 429 responses, and request a raised burst window for scheduled jobs.",
  },
  {
    id: "kb3",
    title: "Exporting reports to CSV, XLSX and PDF",
    category: "Reporting",
    status: "published",
    updatedAt: hoursAgo(48),
    views: 8930,
    aiUses: 612,
    body: "Open a report, use the ⋯ menu and choose Export. CSV and XLSX include raw rows; PDF captures the rendered view. Exports above 50,000 rows are generated asynchronously and emailed as a download link valid for 24 hours.",
  },
  {
    id: "kb4",
    title: "Fixing webhook signature verification errors",
    category: "Developers",
    status: "published",
    updatedAt: hoursAgo(200),
    views: 2740,
    aiUses: 301,
    body: "Compute the HMAC over the raw request body, not the re-serialized JSON. Compare using a timing-safe equality function and allow a five-minute timestamp tolerance to survive clock drift.",
  },
  {
    id: "kb5",
    title: "Seat limits, invites and plan upgrades",
    category: "Billing",
    status: "published",
    updatedAt: hoursAgo(30),
    views: 1980,
    aiUses: 122,
    body: "Free workspaces include 3 seats. Pending invites consume a seat until declined or revoked. Upgrade under Settings → Billing to add seats instantly; prorated charges appear on the next invoice.",
  },
  {
    id: "kb6",
    title: "Duplicate charge troubleshooting for finance teams",
    category: "Billing",
    status: "draft",
    updatedAt: hoursAgo(10),
    views: 0,
    aiUses: 0,
    body: "Duplicate charges usually come from a retried payment intent. Locate both charge IDs, refund the later one and attach the refund reference to the invoice so finance can reconcile.",
  },
];

export const ticketVolume = [
  { day: "Mon", created: 78, resolved: 71, ai: 29 },
  { day: "Tue", created: 92, resolved: 84, ai: 36 },
  { day: "Wed", created: 85, resolved: 88, ai: 34 },
  { day: "Thu", created: 104, resolved: 95, ai: 45 },
  { day: "Fri", created: 96, resolved: 101, ai: 42 },
  { day: "Sat", created: 41, resolved: 44, ai: 24 },
  { day: "Sun", created: 33, resolved: 35, ai: 21 },
];

export const resolutionTrend = [
  { week: "W1", hours: 9.4, firstResponse: 1.9 },
  { week: "W2", hours: 8.1, firstResponse: 1.6 },
  { week: "W3", hours: 7.6, firstResponse: 1.4 },
  { week: "W4", hours: 6.2, firstResponse: 1.1 },
  { week: "W5", hours: 5.4, firstResponse: 0.9 },
  { week: "W6", hours: 4.8, firstResponse: 0.8 },
];

export const satisfactionTrend = [
  { month: "Apr", csat: 4.1, nps: 32 },
  { month: "May", csat: 4.2, nps: 36 },
  { month: "Jun", csat: 4.3, nps: 41 },
  { month: "Jul", csat: 4.5, nps: 46 },
  { month: "Aug", csat: 4.4, nps: 44 },
  { month: "Sep", csat: 4.6, nps: 51 },
];

export const channelMix = [
  { channel: "Email", value: 46 },
  { channel: "Chat", value: 34 },
  { channel: "Phone", value: 12 },
  { channel: "Social", value: 8 },
];
