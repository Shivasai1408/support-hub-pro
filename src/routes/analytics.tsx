import { createFileRoute } from "@tanstack/react-router";
import { Clock, Smile, Sparkles, Ticket, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupport } from "@/lib/support-store";

export const Route = createFileRoute("/analytics")({ component: AnalyticsPage });
function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Clock }) {
  return <Card><CardContent className="p-5"><Icon className="size-5 text-primary"/><p className="mt-4 text-sm text-muted-foreground">{label}</p><p className="font-display text-3xl font-semibold">{value}</p></CardContent></Card>;
}
function AnalyticsPage() {
  const { tickets, customers, loading } = useSupport();
  const resolved = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;
  const ai = tickets.filter(t => t.aiHandled).length;
  const rated = tickets.filter(t => t.firstResponseMins !== null && t.firstResponseMins !== undefined);
  const avg = rated.length ? Math.round(rated.reduce((s, t) => s + (t.firstResponseMins ?? 0), 0) / rated.length) : 0;
  const aiPct = tickets.length ? Math.round((ai / tickets.length) * 100) : 0;
  const csatCustomers = customers.filter(c => Number(c.csat) > 0);
  const csat = csatCustomers.length ? csatCustomers.reduce((s, c) => s + Number(c.csat), 0) / csatCustomers.length : 0;

  const now = Date.now();
  const ticketVolume = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    const dayTickets = tickets.filter(t => t.createdAt.slice(0, 10) === key);
    const dayResolved = tickets.filter(t => (t.status === "resolved" || t.status === "closed") && t.updatedAt.slice(0, 10) === key);
    const dayAi = dayTickets.filter(t => t.aiHandled);
    return { day: d.toLocaleDateString(undefined, { weekday: "short" }), created: dayTickets.length, resolved: dayResolved.length, ai: dayAi.length };
  });

  const resolutionTrend = Array.from({ length: 4 }, (_, i) => {
    const end = new Date(now - (3 - i) * 7 * 86400000);
    const start = new Date(end.getTime() - 6 * 86400000);
    const completed = tickets.filter(t => (t.status === "resolved" || t.status === "closed") && new Date(t.updatedAt) >= start && new Date(t.updatedAt) <= new Date(end.getTime() + 86400000));
    const responseTimes = completed.filter(t => t.firstResponseMins !== null).map(t => t.firstResponseMins ?? 0);
    const hours = responseTimes.length ? Number((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 60).toFixed(1)) : 0;
    return { week: `W${i + 1}`, hours };
  });

  return <AppShell title="Analytics" description="Support performance, automation and customer experience trends.">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Total tickets" value={loading ? "…" : String(tickets.length)} icon={Ticket}/>
      <Metric label="Resolved / closed" value={loading ? "…" : String(resolved)} icon={TrendingUp}/>
      <Metric label="AI handled" value={loading ? "…" : `${aiPct}%`} icon={Sparkles}/>
      <Metric label="Avg first response" value={loading ? "…" : `${avg}m`} icon={Clock}/>
    </div>
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Ticket volume — last 7 days</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={ticketVolume}><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis dataKey="day"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="created" fill="var(--chart-1)"/><Bar dataKey="resolved" fill="var(--chart-2)"/><Bar dataKey="ai" fill="var(--chart-3)"/></BarChart></ResponsiveContainer></CardContent></Card>
      <Card><CardHeader><CardTitle>First-response trend — last 4 weeks</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={resolutionTrend}><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis dataKey="week"/><YAxis/><Tooltip formatter={(value) => [`${value}h`, "Avg response"]}/><Area dataKey="hours" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15}/></AreaChart></ResponsiveContainer></CardContent></Card>
    </div>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Card><CardHeader><CardTitle>Customer experience</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm"><Smile className="size-4 text-primary"/>CSAT</span><strong>{csatCustomers.length ? `${csat.toFixed(1)} / 5` : "No ratings yet"}</strong></div><div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, csat * 20)}%` }}/></div><p className="text-xs text-muted-foreground">{csatCustomers.length ? `Based on ${csatCustomers.length} customer rating${csatCustomers.length === 1 ? "" : "s"} currently stored.` : "Ratings will appear here when real customer feedback is recorded."}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Automation impact</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between"><span className="text-sm">Tickets handled by AI</span><strong>{ai} / {tickets.length}</strong></div><p className="mt-2 text-xs text-muted-foreground">Calculated from real tickets marked as AI handled. No demo values are used.</p></CardContent></Card>
    </div>
  </AppShell>;
}
