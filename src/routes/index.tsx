import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  Inbox as InboxIcon,
  Smile,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { PriorityBadge, SentimentBadge, StatusBadge } from "@/components/support-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ticketVolume, resolutionTrend } from "@/lib/demo-data";
import { timeAgo, useSupport } from "@/lib/support-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Support dashboard — Helm Support" },
      {
        name: "description",
        content:
          "Live view of open tickets, first response time, CSAT and AI resolution rate for your support team.",
      },
      { property: "og:title", content: "Support dashboard — Helm Support" },
      {
        property: "og:description",
        content: "Live view of open tickets, response time, CSAT and AI automation for your support team.",
      },
    ],
  }),
  component: Dashboard,
});

function Kpi({
  label,
  value,
  delta,
  positive,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: typeof Clock;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Icon className="size-4" />
          </div>
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${positive ? "text-success" : "text-destructive"}`}
          >
            {positive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {delta}
          </span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{label}</p>
        <p className="font-display text-3xl font-semibold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { tickets, agents, getCustomer } = useSupport();
  const open = tickets.filter((t) => t.status === "open");
  const aiRate = Math.round((tickets.filter((t) => t.aiHandled).length / tickets.length) * 100);
  const responded = tickets.filter((t) => t.firstResponseMins !== null);
  const avgFirst = Math.round(
    responded.reduce((s, t) => s + (t.firstResponseMins ?? 0), 0) / Math.max(1, responded.length),
  );
  const recent = [...tickets].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 5);

  return (
    <AppShell
      title="Support dashboard"
      description="Everything your team needs to watch today, in one place."
      actions={
        <Button asChild variant="outline">
          <Link to="/inbox">
            Go to inbox <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Open tickets"
          value={String(open.length)}
          delta="8%"
          positive={false}
          icon={InboxIcon}
          hint={`${open.filter((t) => !t.assigneeId).length} still unassigned`}
        />
        <Kpi
          label="Median first response"
          value={`${avgFirst}m`}
          delta="12%"
          positive
          icon={Clock}
          hint="Target: under 60 minutes"
        />
        <Kpi label="CSAT (30 days)" value="4.6" delta="0.2" positive icon={Smile} hint="From 412 rated replies" />
        <Kpi
          label="AI resolution rate"
          value={`${aiRate}%`}
          delta="6%"
          positive
          icon={Sparkles}
          hint="Resolved without agent reply"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ticket volume this week</CardTitle>
            <CardDescription>Created vs resolved, with the share handled by AI.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketVolume}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="created" name="Created" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ai" name="AI handled" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution time</CardTitle>
            <CardDescription>Average hours to resolve, last 6 weeks.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resolutionTrend}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Area
                  dataKey="hours"
                  name="Hours to resolve"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>The five conversations that moved most recently.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.map((t) => {
              const customer = getCustomer(t.customerId);
              return (
                <Link
                  key={t.id}
                  to="/inbox"
                  search={{ ticket: t.id }}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-accent/50"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-secondary text-xs font-semibold">
                      {customer?.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.subject}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.id} · {customer?.company} · {timeAgo(t.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                  <SentimentBadge sentiment={t.sentiment} className="hidden sm:inline-flex" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team load</CardTitle>
            <CardDescription>Active tickets per agent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {agents.map((a) => {
              const count = tickets.filter(
                (t) => t.assigneeId === a.id && t.status !== "closed" && t.status !== "resolved",
              ).length;
              return (
                <div key={a.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{a.name}</span>
                    <span className="text-muted-foreground">{count} active</span>
                  </div>
                  <Progress value={Math.min(100, count * 25)} className="mt-2 h-1.5" />
                  <p className="mt-1 text-xs text-muted-foreground">{a.role}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
