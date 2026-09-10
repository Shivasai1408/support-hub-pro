const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
export const supabaseUrl = env.VITE_SUPABASE_URL ?? env.SUPABASE_URL ?? "";
export const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? env.SUPABASE_ANON_KEY ?? "";
const ACCESS_TOKEN_KEY = "support-hub-access-token";
export function isSupabaseConfigured() { return Boolean(supabaseUrl && supabaseKey); }
export function getAccessToken() { try { return localStorage.getItem(ACCESS_TOKEN_KEY); } catch { return null; } }
function setAccessToken(token: string | null) { try { if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token); else localStorage.removeItem(ACCESS_TOKEN_KEY); } catch {} }
async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!isSupabaseConfigured()) throw new Error("Supabase is not configured for this deployment.");
  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, { ...options, headers: { apikey: supabaseKey, "Content-Type": "application/json", ...(options.headers ?? {}) } });
  if (!response.ok) { const detail = await response.text(); let message = detail; try { const parsed = JSON.parse(detail); message = parsed.msg || parsed.message || parsed.error_description || detail; } catch {} throw new Error(message || `Authentication request failed (${response.status}).`); }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
export type AuthUser = { id: string; email?: string; user_metadata?: { name?: string; full_name?: string } };
type AuthResponse = { access_token?: string; user?: AuthUser };
export async function signUp(email: string, password: string, name: string) { const result = await authRequest<AuthResponse>("signup", { method: "POST", body: JSON.stringify({ email, password, data: { name, full_name: name } }) }); if (result.access_token) setAccessToken(result.access_token); return result; }
export async function signInWithPassword(email: string, password: string) { const result = await authRequest<AuthResponse>("token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) }); if (!result.access_token) throw new Error("No active session was returned. If email confirmation is required, confirm your email first."); setAccessToken(result.access_token); return result; }
export async function getCurrentUser() { const token = getAccessToken(); if (!token) return null; try { return await authRequest<AuthUser>("user", { headers: { Authorization: `Bearer ${token}` } }); } catch { setAccessToken(null); return null; } }
export async function signOut() { const token = getAccessToken(); try { if (token) await authRequest<void>("logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } }); } finally { setAccessToken(null); } }
export async function resetPassword(email: string) { return authRequest<void>("recover", { method: "POST", body: JSON.stringify({ email }) }); }
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!isSupabaseConfigured()) throw new Error("Supabase is not configured for this deployment.");
  const token = getAccessToken();
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, { ...options, headers: { apikey: supabaseKey, Authorization: `Bearer ${token ?? supabaseKey}`, "Content-Type": "application/json", ...(options.headers ?? {}) } });
  if (!response.ok) { const detail = await response.text(); throw new Error(`Supabase request failed (${response.status}): ${detail}`); }
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
