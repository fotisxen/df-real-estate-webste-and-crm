import ServicesClient from "@/components/ServicesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Υπηρεσίες",
  description:
    "Πώληση, αγορά, ενοικίαση, διαχείριση και εκτίμηση ακινήτων στη Θεσσαλονίκη — όλες οι υπηρεσίες της DF Real Estate.",
};

export default function ServicesPage() {
  return <ServicesClient />;
}
