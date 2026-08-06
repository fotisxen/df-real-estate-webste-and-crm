// Single source of truth for transaction categories, mirroring the pattern
// in propertyFields.ts — the form and any category-based grouping both
// read from here instead of hand-writing the list twice.

export const INCOME_CATEGORIES = [
  "Προμήθεια Πώλησης",
  "Προμήθεια Ενοικίασης",
  "Αμοιβή Διαχείρισης Ακινήτου",
  "Αμοιβή Εκτίμησης",
  "Λοιπά Έσοδα",
] as const;

export const EXPENSE_CATEGORIES = [
  "Διαφήμιση & Marketing",
  "Ενοίκιο Γραφείου",
  "Λογαριασμοί & Λειτουργικά",
  "Μετακινήσεις",
  "Προμήθειες σε Συνεργάτες",
  "Λογιστικά & Νομικά",
  "Εξοπλισμός",
  "Λοιπά Έξοδα",
] as const;

export function categoriesFor(type: "income" | "expense"): readonly string[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function formatEuro(amount: number) {
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);
}
