"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Status = "idle" | "sending" | "sent" | "error";
type Tone = "light" | "dark";
type Form = {
  name: string;
  occasion: string;
  location: string;
  date: string;
  instagram: string;
  email: string;
};

const EMPTY: Form = { name: "", occasion: "", location: "", date: "", instagram: "", email: "" };

/**
 * Kontakt forma u stilu „popuni prazninu" — svaki label u svom redu, a polje
 * (podvučena praznina) odmah ispod njega, centrirano. Backend prima samo
 * name/email/message, pa se dodatna polja (prilika/lokacija/datum/instagram)
 * spajaju u `message` prije slanja. Koristi se i na /kontakt (light) i u
 * footeru na svakoj stranici (dark) — ISTA forma svuda, radi konzistentnosti.
 */
export function ContactMadLibs({ tone = "light" }: { tone?: Tone }) {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState<Form>(EMPTY);
  const dark = tone === "dark";

  const update = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const details = [
      form.occasion && `Prilika: ${form.occasion}`,
      form.location && `Lokacija: ${form.location}`,
      form.date && `Datum: ${form.date}`,
      form.instagram && `Instagram: ${form.instagram}`,
    ].filter(Boolean);
    const message = details.length > 0 ? details.join("\n") : "Upit sa kontakt forme.";

    try {
      const res = await fetch(`${API}/api/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, message }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setForm(EMPTY);
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="py-10 text-center">
        <p className={`display-serif text-3xl md:text-4xl ${dark ? "text-cream" : "text-ink"}`}>Hvala Vam!</p>
        <p className={`mt-3 ${dark ? "text-cream/60" : "text-muted"}`}>
          Poruka je poslata. Javljam se u najkraćem mogućem roku.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-center text-center">
      <div className="flex flex-col items-center gap-10">
        <Field dark={dark} label="Zovem se">
          <input
            value={form.name}
            onChange={update("name")}
            placeholder="ime i prezime"
            required
            className={fieldInputCls(dark)}
          />
        </Field>

        <Field dark={dark} label="I javljam vam se povodom">
          <input
            value={form.occasion}
            onChange={update("occasion")}
            placeholder="vjenčanja"
            className={fieldInputCls(dark)}
          />
        </Field>

        <Field dark={dark} label="U">
          <input
            value={form.location}
            onChange={update("location")}
            placeholder="lokacija"
            className={fieldInputCls(dark)}
          />
        </Field>

        <Field dark={dark} label="Dana">
          <input
            value={form.date}
            onChange={update("date")}
            placeholder="datum"
            className={fieldInputCls(dark)}
          />
        </Field>

        <Field dark={dark} label="A na Instagramu sam">
          <input
            value={form.instagram}
            onChange={update("instagram")}
            placeholder="@korisničko ime"
            className={fieldInputCls(dark)}
          />
        </Field>

        <Field dark={dark} label="Javite mi se na">
          <input
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="email adresa"
            required
            className={`${fieldInputCls(dark)} !text-lg sm:!text-xl`}
          />
        </Field>
      </div>

      {status === "error" && (
        <p className={`mt-8 text-sm ${dark ? "text-red-300" : "text-red-700"}`}>
          Došlo je do greške. Pokušajte ponovo ili pišite direktno na email.
        </p>
      )}

      <div className="mt-14">
        <button
          type="submit"
          disabled={status === "sending"}
          className={`eyebrow border px-10 py-4 transition-colors duration-500 disabled:opacity-50 ${
            dark ? "border-cream/40 text-cream hover:bg-cream hover:!text-ink" : "border-ink hover:bg-ink hover:!text-cream"
          }`}
        >
          {status === "sending" ? "Šaljem…" : "Pošalji poruku"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, dark, children }: { label: string; dark: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className={`text-sm uppercase tracking-[0.12em] sm:text-base ${dark ? "text-cream/70" : "text-ink/70"}`}>
        {label}
      </span>
      {children}
    </div>
  );
}

function fieldInputCls(dark: boolean): string {
  return `w-64 sm:w-80 border-b bg-transparent px-1 pb-1 text-center text-base uppercase tracking-[0.1em] outline-none transition-colors duration-500 sm:text-lg ${
    dark
      ? "border-cream/25 text-cream placeholder:text-cream/30 focus:border-cream"
      : "border-ink/25 text-ink placeholder:text-ink/30 focus:border-ink"
  }`;
}
