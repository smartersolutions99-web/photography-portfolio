"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CameraDatePicker } from "./CameraDatePicker";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const SERVICES = ["vjenčanje", "portretnu sesiju", "fotografisanje događaja", "porodičnu sesiju", "nešto drugo"];
const EASE = [0.22, 1, 0.36, 1] as const;

type Status = "idle" | "sending" | "sent" | "error";

function stampDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}.`;
}

/**
 * Kontakt forma u stilu „pisma" — mala uppercase labela iznad podvučene praznine.
 * Sva polja su ujednačene pune-širine praznine (i dropdown i date picker), sa
 * dosta vazduha. Šalje {name, email, message}; usluga/lokacija/datum sažima u poruku.
 */
export function InlineContactForm({ services = SERVICES }: { services?: string[] }) {
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const message =
      `Upit sa sajta.\n` +
      `Usluga: ${service ?? "—"}\n` +
      `Lokacija: ${location || "—"}\n` +
      `Termin: ${date ? stampDate(date) : "—"}`;
    try {
      const res = await fetch(`${API}/api/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mx-auto max-w-md border border-line bg-cream/50 px-8 py-12 text-center">
        <p className="display-serif text-3xl text-ink">Hvala Vam!</p>
        <p className="mt-3 text-muted">Upit je poslat. Javljam se u najkraćem roku.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md">
      <div className="space-y-9">
        <Field label="Moje ime je">
          <Blank value={name} onChange={setName} placeholder="ime i prezime" required autoComplete="name" />
        </Field>

        <Field label="Planiram">
          <InlineSelect value={service} onChange={setService} options={services} placeholder="izaberite uslugu" />
        </Field>

        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
          <Field label="Na dan">
            <CameraDatePicker value={date} onChange={setDate} />
          </Field>
          <Field label="U mjestu">
            <Blank value={location} onChange={setLocation} placeholder="lokacija" />
          </Field>
        </div>

        <Field label="Pišite mi na">
          <Blank value={email} onChange={setEmail} placeholder="email adresa" type="email" required autoComplete="email" />
        </Field>
      </div>

      {status === "error" && (
        <p className="mt-8 text-center text-sm text-red-700">
          Došlo je do greške. Pokušajte ponovo ili pišite direktno na email.
        </p>
      )}

      <div className="mt-12 flex justify-center">
        <button
          type="submit"
          disabled={status === "sending"}
          className="eyebrow inline-flex items-center gap-3 border border-ink px-12 py-4 transition-colors duration-500 hover:bg-ink hover:!text-cream disabled:opacity-50"
        >
          {status === "sending" ? "Šaljem…" : "Pošalji upit"}
          <span aria-hidden className="text-accent">◉</span>
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      <span className="block text-[0.6rem] font-medium uppercase tracking-[0.26em] text-ink/40">{label}</span>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** Podvučena „praznina" pune širine — centriran tekst. */
function Blank({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <input
      type={type}
      required={required}
      autoComplete={autoComplete}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border-b border-ink/20 bg-transparent pb-2 text-center text-lg text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-accent"
    />
  );
}

/** Custom dropdown (usluga) — puna širina, viewport-svjestan popover. */
function InlineSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string | null;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [popLeft, setPopLeft] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openSelect() {
    const el = ref.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const w = Math.min(240, vw - 40);
      let vp = r.left + r.width / 2 - w / 2;
      vp = Math.max(12, Math.min(vp, vw - w - 12));
      setPopLeft(vp - r.left);
    }
    setOpen(true);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openSelect())}
        className="flex w-full items-center justify-center gap-2 border-b border-ink/20 pb-2 text-lg transition-colors hover:border-ink focus:outline-none focus-visible:border-accent"
      >
        <span className={value ? "text-ink" : "text-ink/25"}>{value ?? placeholder}</span>
        <span className={`text-xs text-accent transition-transform duration-300 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            style={{ left: popLeft }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="absolute top-full z-50 mt-3 w-[15rem] overflow-hidden border border-ink/10 bg-cream text-left shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
          >
            {options.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                  className={`block w-full px-5 py-3 text-left text-base transition-colors hover:bg-ink hover:text-cream ${
                    value === o ? "text-ink" : "text-ink/70"
                  }`}
                >
                  {o}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
