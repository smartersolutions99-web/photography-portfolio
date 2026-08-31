"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Status = "idle" | "sending" | "sent" | "error";
type Tone = "light" | "dark";

/**
 * Kontakt forma — koristi se i na /kontakt (svijetla, puna) i u footeru
 * (tamna, kompaktna) preko `tone` i `compact` propova. Logika slanja je ista.
 */
export function ContactForm({ tone = "light", compact = false }: { tone?: Tone; compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const dark = tone === "dark";
  const inputCls = `w-full border-b bg-transparent py-3 text-lg outline-none transition-colors duration-500 ${
    dark ? "border-cream/25 text-cream focus:border-cream" : "border-line text-ink focus:border-ink"
  }`;
  const labelCls = dark ? "eyebrow !text-cream/50" : "eyebrow";
  const btnCls = `eyebrow border px-10 py-4 transition-colors duration-500 disabled:opacity-50 ${
    dark ? "border-cream/40 text-cream hover:bg-cream hover:!text-ink" : "border-ink hover:bg-ink hover:!text-cream"
  }`;

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`${API}/api/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className={`border p-10 text-center ${dark ? "border-cream/20" : "border-line bg-cream"}`}>
        <p className={`display-serif text-3xl ${dark ? "text-cream" : "text-ink"}`}>Hvala Vam!</p>
        <p className={`mt-3 ${dark ? "text-cream/60" : "text-muted"}`}>
          Poruka je poslata. Javljam se u najkraćem roku.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "space-y-5" : "space-y-8"}>
      <div className={`grid ${compact ? "gap-5" : "gap-8"} md:grid-cols-2`}>
        <Field label="Ime i prezime" labelCls={labelCls}>
          <input required value={form.name} onChange={update("name")} className={inputCls} />
        </Field>
        <Field label="Email" labelCls={labelCls}>
          <input required type="email" value={form.email} onChange={update("email")} className={inputCls} />
        </Field>
      </div>
      <Field label="Poruka" labelCls={labelCls}>
        <textarea
          required
          rows={compact ? 3 : 5}
          value={form.message}
          onChange={update("message")}
          className={`resize-none ${inputCls}`}
        />
      </Field>

      {status === "error" && (
        <p className={`text-sm ${dark ? "text-red-300" : "text-red-700"}`}>
          Došlo je do greške. Pokušajte ponovo ili pišite direktno na email.
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className={btnCls}>
        {status === "sending" ? "Šaljem…" : "Pošalji poruku"}
      </button>
    </form>
  );
}

function Field({ label, labelCls, children }: { label: string; labelCls: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
