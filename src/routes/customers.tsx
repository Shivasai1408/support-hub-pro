import { createFileRoute } from "@tanstack/react-router";
import { Mail, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSupport } from "@/lib/support-store";

export const Route = createFileRoute("/customers")({ component: CustomersPage });

function CustomersPage() {
  const { customers, ticketsForCustomer } = useSupport();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(customers[0]?.id ?? "");
  const filtered = useMemo(() => customers.filter(c => `${c.name} ${c.email} ${c.company}`.toLowerCase().includes(query.toLowerCase())), [customers, query]);
  const selected = customers.find(c => c.id === selectedId) ?? filtered[0];
  return <AppShell title="Customers" description="Customer profiles, plans, support history and satisfaction.">
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card><CardHeader><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search customers..." className="pl-9"/></div></CardHeader><CardContent className="p-0">{filtered.map(c => { const count=ticketsForCustomer(c.id).length; return <button key={c.id} onClick={()=>setSelectedId(c.id)} className={`flex w-full items-center gap-3 border-t p-4 text-left hover:bg-accent/50 ${selected?.id===c.id ? "bg-accent" : ""}`}><Avatar><AvatarFallback>{c.initials}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="font-medium">{c.name}</p><p className="truncate text-xs text-muted-foreground">{c.company} · {c.email}</p></div><div className="text-right"><p className="text-xs font-semibold">{c.plan}</p><p className="text-xs text-muted-foreground">{count} tickets</p></div></button>})}{!filtered.length&&<p className="p-8 text-center text-sm text-muted-foreground">No customers found.</p>}</CardContent></Card>
      {selected && <Card className="h-fit"><CardHeader><div className="flex items-center gap-3"><Avatar className="size-14"><AvatarFallback>{selected.initials}</AvatarFallback></Avatar><div><CardTitle>{selected.name}</CardTitle><p className="text-sm text-muted-foreground">{selected.company}</p></div></div></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-3">{[["Plan",selected.plan],["CSAT",`${selected.csat}/5`],["Location",selected.location],["Since",new Date(selected.since).toLocaleDateString()]].map(([k,v])=><div key={k} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-sm font-semibold">{v}</p></div>)}</div><p className="text-sm"><span className="text-muted-foreground">Lifetime value:</span> ${selected.lifetimeValue.toLocaleString()}</p><p className="text-sm"><span className="text-muted-foreground">Email:</span> {selected.email}</p><Button className="w-full" asChild><a href={`mailto:${selected.email}`}><Mail className="size-4"/>Email customer</a></Button><div><h4 className="mb-2 text-sm font-semibold">Support history</h4><div className="space-y-2">{ticketsForCustomer(selected.id).map(t=><div key={t.id} className="rounded-lg border p-3"><p className="text-sm font-medium">{t.subject}</p><p className="text-xs text-muted-foreground">{t.id} · {t.status}</p></div>)}</div></div></CardContent></Card>}
    </div>
  </AppShell>;
}
