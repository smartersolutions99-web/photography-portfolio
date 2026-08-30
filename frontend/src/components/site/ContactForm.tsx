"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

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
      <div className="border border-line bg-cream p-10 text-center">
        <p className="display-serif text-3xl">Hvala Vam!</p>
        <p className="mt-3 text-muted">Poruka je poslata. Javljam se u najkraćem roku.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <Field label="Ime i prezime">
          <input
            required
            value={form.name}
            onChange={update("name")}
            className="w-full border-b border-line bg-transparent py-3 text-lg outline-none transition-colors focus:border-ink"
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={form.email}
            onChange={update("email")}
            className="w-full border-b border-line bg-transparent py-3 text-lg outline-none transition-colors focus:border-ink"
          />
        </Field>
      </div>
      <Field label="Poruka">
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={update("message")}
          className="w-full resize-none border-b border-line bg-transparent py-3 text-lg outline-none transition-colors focus:border-ink"
        />
      </Field>

      {status === "error" && (
        <p className="text-sm text-red-700">Došlo je do greške. Pokušajte ponovo ili pišite direktno na email.</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="eyebrow border border-ink px-10 py-4 transition-colors hover:bg-ink hover:!text-cream disabled:opacity-50"
      >
        {status === "sending" ? "Šaljem…" : "Pošalji poruku"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
