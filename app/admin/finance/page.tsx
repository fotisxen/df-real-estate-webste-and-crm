import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatEuro } from "@/lib/financeFields";
import AdminTransactionRowActions from "@/components/AdminTransactionRowActions";
import type { Transaction } from "@/types/database";

export const dynamic = "force-dynamic";

type Row = Transaction & {
  properties: { title: string } | null;
  clients: { full_name: string } | null;
};

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7); // "YYYY-MM"
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("el-GR", { month: "short", year: "2-digit" });
}

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: { month?: string; type?: string; year?: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("transactions")
    .select("*, properties(title), clients(full_name)")
    .order("transaction_date", { ascending: false });

  const all = (data ?? []) as Row[];

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const selectedMonth = searchParams.month ?? currentMonth;
  const selectedType = searchParams.type ?? "";
  const selectedYear = Number(searchParams.year ?? selectedMonth.slice(0, 4));

  const filtered = all.filter((t) => {
    if (monthKey(t.transaction_date) !== selectedMonth) return false;
    if (selectedType && t.type !== selectedType) return false;
    return true;
  });

  const income = filtered.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = filtered.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const net = income - expense;

  const yearRows = all.filter((t) => {
    if (Number(t.transaction_date.slice(0, 4)) !== selectedYear) return false;
    if (selectedType && t.type !== selectedType) return false;
    return true;
  });
  const yearIncome = yearRows.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const yearExpense = yearRows.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const yearNet = yearIncome - yearExpense;

  // Last 6 months (including the selected one's context is irrelevant here —
  // this trend always ends at the current calendar month) for the mini chart.
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const trend = months.map((key) => {
    const monthRows = all.filter((t) => monthKey(t.transaction_date) === key);
    return {
      key,
      income: monthRows.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expense: monthRows.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });
  const maxTrend = Math.max(1, ...trend.flatMap((m) => [m.income, m.expense]));

  function monthHref(key: string) {
    const params = new URLSearchParams();
    params.set("month", key);
    if (selectedType) params.set("type", selectedType);
    return `/admin/finance?${params.toString()}`;
  }
  function typeHref(t: string) {
    const params = new URLSearchParams();
    params.set("month", selectedMonth);
    params.set("year", String(selectedYear));
    if (t) params.set("type", t);
    return `/admin/finance?${params.toString()}`;
  }
  function yearHref(year: number) {
    const params = new URLSearchParams();
    params.set("month", selectedMonth);
    params.set("year", String(year));
    if (selectedType) params.set("type", selectedType);
    return `/admin/finance?${params.toString()}`;
  }

  const [y, m] = selectedMonth.split("-").map(Number);
  const prevMonth = `${new Date(y, m - 2, 1).getFullYear()}-${String(new Date(y, m - 2, 1).getMonth() + 1).padStart(2, "0")}`;
  const nextMonth = `${new Date(y, m, 1).getFullYear()}-${String(new Date(y, m, 1).getMonth() + 1).padStart(2, "0")}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Οικονομικά</h1>
        <Link
          href="/admin/finance/new"
          className="rounded-full bg-clay px-5 py-2 font-mono text-xs uppercase tracking-wide text-limestone"
        >
          + Νέα συναλλαγή
        </Link>
      </div>

      {/* Month switcher */}
      <div className="mt-8 flex items-center gap-4 font-mono text-xs uppercase tracking-wide">
        <Link href={monthHref(prevMonth)} className="rounded-full border border-ink/20 px-3 py-1 hover:border-ink">
          ← Προηγούμενος
        </Link>
        <span className="text-ink">{monthLabel(selectedMonth)}</span>
        <Link href={monthHref(nextMonth)} className="rounded-full border border-ink/20 px-3 py-1 hover:border-ink">
          Επόμενος →
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-ink/10 bg-limestone2 p-5">
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50">Έσοδα</p>
          <p className="mt-2 font-display text-2xl text-aegean">{formatEuro(income)}</p>
        </div>
        <div className="rounded-sm border border-ink/10 bg-limestone2 p-5">
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50">Έξοδα</p>
          <p className="mt-2 font-display text-2xl text-clay">{formatEuro(expense)}</p>
        </div>
        <div className="rounded-sm border border-ink/10 bg-limestone2 p-5">
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50">Καθαρό Αποτέλεσμα</p>
          <p className={`mt-2 font-display text-2xl ${net >= 0 ? "text-aegean" : "text-clay"}`}>{formatEuro(net)}</p>
        </div>
      </div>

      {/* Yearly totals */}
      <div className="mt-10 rounded-sm border border-ink/10 bg-ink p-5 text-limestone">
        <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-wide">
          <Link href={yearHref(selectedYear - 1)} className="rounded-full border border-limestone/20 px-3 py-1 hover:border-limestone">
            ← {selectedYear - 1}
          </Link>
          <span>Σύνολο έτους {selectedYear}</span>
          <Link href={yearHref(selectedYear + 1)} className="rounded-full border border-limestone/20 px-3 py-1 hover:border-limestone">
            {selectedYear + 1} →
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-limestone/50">Έσοδα</p>
            <p className="mt-1 font-display text-2xl text-limestone">{formatEuro(yearIncome)}</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-limestone/50">Έξοδα</p>
            <p className="mt-1 font-display text-2xl text-limestone">{formatEuro(yearExpense)}</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-limestone/50">Καθαρό Αποτέλεσμα</p>
            <p className={`mt-1 font-display text-2xl ${yearNet >= 0 ? "text-limestone" : "text-clay"}`}>
              {formatEuro(yearNet)}
            </p>
          </div>
        </div>
      </div>

      {/* 6-month trend */}
      <div className="mt-8 rounded-sm border border-ink/10 bg-limestone2 p-5">
        <p className="font-mono text-xs uppercase tracking-wide text-ink/50">Τελευταίοι 6 μήνες</p>
        <div className="mt-4 flex items-end gap-4">
          {trend.map((m) => (
            <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end justify-center gap-1">
                <div
                  className="w-3 rounded-t-sm bg-aegean"
                  style={{ height: `${(m.income / maxTrend) * 100}%` }}
                  title={`Έσοδα: ${formatEuro(m.income)}`}
                />
                <div
                  className="w-3 rounded-t-sm bg-clay"
                  style={{ height: `${(m.expense / maxTrend) * 100}%` }}
                  title={`Έξοδα: ${formatEuro(m.expense)}`}
                />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wide text-ink/50">{monthLabel(m.key)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4 font-mono text-[10px] uppercase tracking-wide text-ink/50">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-aegean" /> Έσοδα
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-clay" /> Έξοδα
          </span>
        </div>
      </div>

      {/* Type filter */}
      <div className="mt-8 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-wide">
        {[
          { value: "", label: "Όλα" },
          { value: "income", label: "Έσοδα" },
          { value: "expense", label: "Έξοδα" },
        ].map((f) => (
          <Link
            key={f.value}
            href={typeHref(f.value)}
            className={`rounded-full border px-4 py-2 transition-colors ${
              selectedType === f.value ? "border-ink bg-ink text-limestone" : "border-ink/20 hover:border-ink"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Transactions table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse font-mono text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="py-3 pr-4">Ημερομηνία</th>
              <th className="py-3 pr-4">Τύπος</th>
              <th className="py-3 pr-4">Κατηγορία</th>
              <th className="py-3 pr-4">Σχετίζεται με</th>
              <th className="py-3 pr-4">Ποσό</th>
              <th className="py-3 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-ink/5">
                <td className="py-3 pr-4">{new Date(t.transaction_date).toLocaleDateString("el-GR")}</td>
                <td className="py-3 pr-4">
                  <span className={t.type === "income" ? "text-aegean" : "text-clay"}>
                    {t.type === "income" ? "Έσοδο" : "Έξοδο"}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <Link href={`/admin/finance/${t.id}`} className="hover:text-clay">
                    {t.category}
                  </Link>
                  {t.description && <p className="mt-0.5 text-xs normal-case text-ink/40">{t.description}</p>}
                </td>
                <td className="py-3 pr-4 text-xs text-ink/60">
                  {t.properties?.title ?? t.clients?.full_name ?? "—"}
                </td>
                <td className={`py-3 pr-4 ${t.type === "income" ? "text-aegean" : "text-clay"}`}>
                  {t.type === "income" ? "+" : "−"}
                  {formatEuro(t.amount)}
                </td>
                <td className="py-3 pr-4">
                  <AdminTransactionRowActions transaction={t} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-ink/50">Δεν υπάρχουν συναλλαγές για αυτόν τον μήνα.</p>
        )}
      </div>
    </div>
  );
}
