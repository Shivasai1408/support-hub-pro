import { cn } from "@/lib/utils";
import type { Sentiment, TicketPriority, TicketStatus } from "@/lib/demo-data";

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-info/12 text-info border-info/30",
  pending: "bg-warning/15 text-warning-foreground border-warning/40",
  resolved: "bg-success/12 text-success border-success/30",
  closed: "bg-muted text-muted-foreground border-border",
};

const priorityStyles: Record<TicketPriority, string> = {
  urgent: "bg-destructive/12 text-destructive border-destructive/30",
  high: "bg-warning/15 text-warning-foreground border-warning/40",
  normal: "bg-secondary text-secondary-foreground border-border",
  low: "bg-muted text-muted-foreground border-border",
};

const sentimentStyles: Record<Sentiment, string> = {
  positive: "bg-success/12 text-success border-success/30",
  neutral: "bg-secondary text-secondary-foreground border-border",
  negative: "bg-destructive/12 text-destructive border-destructive/30",
};

const base =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap";

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  return (
    <span className={cn(base, statusStyles[status], className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: TicketPriority; className?: string }) {
  return <span className={cn(base, priorityStyles[priority], className)}>{priority}</span>;
}

export function SentimentBadge({ sentiment, className }: { sentiment: Sentiment; className?: string }) {
  return <span className={cn(base, sentimentStyles[sentiment], className)}>{sentiment}</span>;
}
