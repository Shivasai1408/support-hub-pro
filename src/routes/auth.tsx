import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/helm-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupport } from "@/lib/support-store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Helm Support" },
      {
        name: "description",
        content: "Sign in to Helm Support, the AI-assisted service desk for modern support teams.",
      },
      { property: "og:title", content: "Sign in — Helm Support" },
      {
        property: "og:description",
        content: "Sign in to Helm Support, the AI-assisted service desk for modern support teams.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { signIn } = useSupport();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("maya@helm.support");
  const [password, setPassword] = useState("demo1234");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) return setError("Enter a valid work email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (mode === "signup" && name.trim().length < 2) return setError("Tell us your full name.");
    setPending(true);
    setTimeout(() => {
      setPending(false);
      signIn(email, mode === "signup" ? name : undefined);
      toast.success(mode === "signup" ? "Workspace created" : "Welcome back");
      navigate({ to: "/" });
    }, 700);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" width={512} height={512} className="size-9" />
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold">Helm Support</p>
              <p className="text-xs text-muted-foreground">AI service desk</p>
            </div>
          </div>

          <Tabs value={mode} onValueChange={setMode} className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <TabsContent value="signup" className="m-0 space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Moore" />
              </TabsContent>

              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => toast.info("Reset link sent to your inbox (demo)")}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />}
                {mode === "signin" ? "Sign in to workspace" : "Create workspace"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Demo workspace — credentials are pre-filled and no data leaves your browser.
              </p>
            </form>
          </Tabs>
        </div>
      </div>

      <div className="hidden flex-col justify-center gap-8 bg-sidebar px-12 text-sidebar-foreground lg:flex">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-sidebar-primary uppercase">
            Support, with a copilot
          </p>
          <h2 className="mt-3 max-w-md font-display text-3xl leading-tight font-semibold">
            Resolve more conversations with fewer keystrokes.
          </h2>
          <p className="mt-3 max-w-md text-sm text-sidebar-foreground/70">
            Helm drafts replies, summarises long threads, reads sentiment and routes tickets to the right
            team — while your agents stay in control of every send.
          </p>
        </div>
        <ul className="space-y-3 text-sm">
          {[
            "AI-drafted replies grounded in your knowledge base",
            "Automatic classification, priority and routing",
            "Sentiment and next-best-action on every thread",
            "Live KPIs for response time, CSAT and automation",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sidebar-primary" />
              <span className="text-sidebar-foreground/85">{item}</span>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-3 gap-4 border-t border-sidebar-border pt-6">
          {[
            ["41%", "Tickets auto-resolved"],
            ["52m", "Median first response"],
            ["4.6", "CSAT this month"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-display text-2xl font-semibold">{value}</p>
              <p className="text-xs text-sidebar-foreground/60">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
