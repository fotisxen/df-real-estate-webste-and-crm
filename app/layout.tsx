import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext", "greek"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DF Real Estate | Ακίνητα προς πώληση & ενοικίαση",
    template: "%s | DF Real Estate",
  },
  description:
    "Σπίτια, γραφεία και επαγγελματικοί χώροι προς πώληση και ενοικίαση.",
  openGraph: {
    type: "website",
    locale: "el_GR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el" className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <LanguageProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
