"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return null;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="border-b border-ink/10 bg-ink text-limestone">
      <div className="container-content flex items-center justify-between py-4 font-mono text-xs uppercase tracking-wide">
        <div className="flex gap-6">
          <Link href="/admin/properties" className="hover:text-clay">
            Ακίνητα
          </Link>
          <Link href="/admin/properties/new" className="hover:text-clay">
            + Νέο ακίνητο
          </Link>
          <Link href="/admin/clients" className="hover:text-clay">
            Πελάτες
          </Link>
        </div>
        <button onClick={handleSignOut} className="hover:text-clay">
          Αποσύνδεση
        </button>
      </div>
    </div>
  );
}
