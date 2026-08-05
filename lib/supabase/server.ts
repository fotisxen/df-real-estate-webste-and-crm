import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// Use this client in Server Components, Server Actions, and Route Handlers.
// It reads/writes the auth cookie via Next's cookies() API so the admin
// session survives across requests.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component render — safe to ignore
            // because middleware also refreshes the session.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Same as above.
          }
        },
      },
    }
  );
}

// Admin-only client using the service role key. Bypasses Row Level
// Security entirely — only ever use this inside server-only code
// (route handlers, server actions), never import it into a Client
// Component, and never use it to serve data to the public site.
export function createServiceRoleClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get() { return undefined; }, set() {}, remove() {} } }
  );
}
