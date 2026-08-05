"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ContactPage() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const fields = [
    { name: "name", label: t("contact.name"), type: "text" },
    { name: "email", label: t("contact.email"), type: "email" },
    { name: "phone", label: t("contact.phone"), type: "tel" },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="container-content grid gap-12 py-20 md:grid-cols-2 md:gap-20 md:py-28">
      <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp}>
        <motion.p
          initial="hidden"
          animate="show"
          custom={0}
          variants={fadeUp}
          className="font-mono text-xs uppercase tracking-wide text-clay"
        >
          {t("contact.kicker")}
        </motion.p>
        <motion.h1
          initial="hidden"
          animate="show"
          custom={1}
          variants={fadeUp}
          className="mt-3 text-4xl leading-tight md:text-5xl"
        >
          {t("contact.title")}
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="show"
          custom={2}
          variants={fadeUp}
          className="mt-5 max-w-sm text-ink/70"
        >
          {t("contact.subtitle")}
        </motion.p>

        <motion.div initial="hidden" animate="show" custom={3} variants={fadeUp} className="mt-10 space-y-4">
          <a
            href="tel:+306984496660"
            className="group flex items-center gap-3 font-mono text-sm text-ink transition-colors hover:text-clay"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-limestone transition-colors group-hover:bg-clay">
              ☎
            </span>
            698 449 6660
          </a>
          <a
            href="mailto:info@df-real-estate.com"
            className="group flex items-center gap-3 font-mono text-sm text-ink transition-colors hover:text-clay"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-limestone transition-colors group-hover:bg-clay">
              ✉
            </span>
            info@df-real-estate.com
          </a>
        </motion.div>
      </motion.div>

      <motion.form
        initial="hidden"
        animate="show"
        custom={1}
        variants={fadeUp}
        onSubmit={handleSubmit}
        className="rounded-sm border border-ink/10 bg-limestone2 p-8"
      >
        {fields.map((f, i) => (
          <motion.label
            key={f.name}
            initial="hidden"
            animate="show"
            custom={i + 2}
            variants={fadeUp}
            className="mb-4 block font-mono text-xs uppercase tracking-wide text-ink/60"
          >
            {f.label}
            <input
              name={f.name}
              type={f.type}
              required={f.name !== "phone"}
              className="mt-1 w-full rounded-sm border border-ink/20 bg-limestone px-3 py-2 font-body text-base normal-case tracking-normal text-ink outline-none transition-colors focus:border-clay"
            />
          </motion.label>
        ))}

        <motion.label
          initial="hidden"
          animate="show"
          custom={5}
          variants={fadeUp}
          className="mb-2 block font-mono text-xs uppercase tracking-wide text-ink/60"
        >
          {t("contact.message")}
          <textarea
            name="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full resize-none rounded-sm border border-ink/20 bg-limestone px-3 py-2 font-body text-base normal-case tracking-normal text-ink outline-none transition-colors focus:border-clay"
          />
        </motion.label>

        <motion.button
          initial="hidden"
          animate="show"
          custom={6}
          variants={fadeUp}
          type="submit"
          disabled={status === "sending"}
          whileTap={{ scale: 0.97 }}
          className="mt-4 w-full rounded-full bg-ink py-3 font-mono text-xs uppercase tracking-wide text-limestone transition-colors hover:bg-clay disabled:opacity-50"
        >
          {status === "sending" ? t("contact.sending") : t("contact.submit")}
        </motion.button>

        {status === "sent" && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-aegean2"
          >
            {t("contact.success")}
          </motion.p>
        )}
        {status === "error" && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-clay"
          >
            {t("contact.error")}
          </motion.p>
        )}
      </motion.form>
    </div>
  );
}
