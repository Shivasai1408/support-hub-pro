import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Eye, Pencil, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSupport } from "@/lib/support-store";
import type { Article } from "@/lib/demo-data";

export const Route = createFileRoute("/knowledge")({ component: KnowledgePage });

function KnowledgePage() {
  const { articles, saveArticle, deleteArticle } = useSupport();
  const [query,setQuery]=useState("");
  const [editing,setEditing]=useState<Article|null>(null);
  const filtered=useMemo(()=>articles.filter(a=>`${a.title} ${a.category} ${a.body}`.toLowerCase().includes(query.toLowerCase())),[articles,query]);
  const blank:Article={id:`kb-${Date.now()}`,title:"",category:"General",body:"",status:"draft",updatedAt:new Date().toISOString(),views:0,aiUses:0};
  return <AppShell title="Knowledge base" description="Create and maintain the articles your team and AI use to answer customers." actions={<Button onClick={()=>setEditing(blank)}><Plus className="size-4"/>New article</Button>}>
    {editing && <Card className="mb-4"><CardHeader><CardTitle>{editing.title ? "Edit article" : "New article"}</CardTitle></CardHeader><CardContent className="space-y-3"><Input value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})} placeholder="Article title"/><Input value={editing.category} onChange={e=>setEditing({...editing,category:e.target.value})} placeholder="Category"/><textarea value={editing.body} onChange={e=>setEditing({...editing,body:e.target.value})} placeholder="Write the article content..." className="min-h-36 w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"/><div className="flex gap-2"><Button onClick={()=>{if(editing.title.trim()){saveArticle({...editing,updatedAt:new Date().toISOString()});setEditing(null)}}}>Save article</Button><Button variant="outline" onClick={()=>setEditing(null)}>Cancel</Button></div></CardContent></Card>}
    <Card><CardHeader><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search knowledge base..." className="pl-9"/></div></CardHeader><CardContent className="grid gap-3 md:grid-cols-2">{filtered.map(a=><div key={a.id} className="rounded-xl border p-4"><div className="flex items-start gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><BookOpen className="size-5"/></div><div className="min-w-0 flex-1"><h3 className="font-semibold">{a.title}</h3><p className="mt-1 text-xs text-muted-foreground">{a.category} · {a.status}</p></div></div><p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{a.body}</p><div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span className="flex gap-3"><span className="flex items-center gap-1"><Eye className="size-3.5"/>{a.views.toLocaleString()}</span><span className="flex items-center gap-1"><Sparkles className="size-3.5"/>{a.aiUses} AI uses</span></span><span className="flex gap-1"><Button size="icon" variant="ghost" onClick={()=>setEditing(a)} aria-label="Edit"><Pencil className="size-4"/></Button><Button size="icon" variant="ghost" onClick={()=>deleteArticle(a.id)} aria-label="Delete"><Trash2 className="size-4"/></Button></span></div></div>)}{!filtered.length&&<p className="col-span-full p-8 text-center text-sm text-muted-foreground">No articles found.</p>}</CardContent></Card>
  </AppShell>;
}
