"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError("Λάθος στοιχεία σύνδεσης.");
      return;
    }

    router.push(searchParams.get("next") ?? "/admin/properties");
    router.refresh();
  }

  return (
    <div className="container-content flex min-h-[70vh] items-center justify-center py-16">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-sm border border-ink/10 bg-limestone2 p-8">
        <h1 className="text-2xl">Σύνδεση διαχειριστή</h1>
        <p className="mt-1 text-sm text-ink/60">Μόνο για την ομάδα του γραφείου.</p>

        <label className="mt-6 block font-mono text-xs uppercase tracking-wide text-ink/60">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-sm border border-ink/20 bg-limestone px-3 py-2 font-body text-base normal-case tracking-normal"
          />
        </label>

        <label className="mt-4 block font-mono text-xs uppercase tracking-wide text-ink/60">
          Κωδικός
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-sm border border-ink/20 bg-limestone px-3 py-2 font-body text-base normal-case tracking-normal"
          />
        </label>

        {error && <p className="mt-4 text-sm text-clay">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-ink py-3 font-mono text-xs uppercase tracking-wide text-limestone transition-colors hover:bg-clay disabled:opacity-50"
        >
          {loading ? "Σύνδεση..." : "Σύνδεση"}
        </button>
      </form>
    </div>
  );
}
