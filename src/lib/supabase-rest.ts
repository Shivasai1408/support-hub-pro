const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

export const supabaseUrl = env.VITE_SUPABASE_URL ?? env.SUPABASE_URL ?? "";
export const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? env.SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!isSupabaseConfigured()) throw new Error("Supabase is not configured for this deployment.");
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const db = {
  select: <T>(table: string, query = "select=*") => request<T[]>(`${table}?${query}`),
  insert: <T>(table: string, rows: unknown[]) => request<T[]>(table, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(rows) }),
  upsert: <T>(table: string, rows: unknown[]) => request<T[]>(table, { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(rows) }),
  update: <T>(table: string, query: string, patch: unknown) => request<T[]>(`${table}?${query}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch) }),
  remove: (table: string, query: string) => request<void>(`${table}?${query}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }),
};
