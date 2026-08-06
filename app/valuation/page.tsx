import { Suspense } from "react";
import ValuationForm from "@/components/ValuationForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Δωρεάν Εκτίμηση Ακινήτου",
  description:
    "Ζητήστε δωρεάν και χωρίς δέσμευση εκτίμηση της αγοραίας αξίας του ακινήτου σας στη Θεσσαλονίκη.",
};

export default function ValuationPage() {
  return (
    <Suspense>
      <ValuationForm />
    </Suspense>
  );
}
