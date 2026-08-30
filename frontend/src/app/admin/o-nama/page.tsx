"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button, Card, ErrorBox, Field, PageTitle, Spinner, TextArea, TextInput } from "@/components/admin/ui";
import { apiGet, apiSend, apiUpload } from "@/lib/adminApi";
import type { About } from "@/lib/types";

export default function AboutAdminPage() {
  const [about, setAbout] = useState<About | null>(null);
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [portraitBusy, setPortraitBusy] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const a = await apiGet<About>("/api/admin/about");
        setAbout(a);
        setHeading(a.heading ?? "");
        setBody(a.body ?? "");
      } catch {
        setError("Ne mogu učitati sadržaj. Provjerite da li backend radi.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await apiSend<About>("/api/admin/about", "PUT", { heading, body });
      setAbout(updated);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Greška.");
    } finally {
      setSaving(false);
    }
  }

  async function onPortraitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalPreview(URL.createObjectURL(file));
    setPortraitBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const updated = await apiUpload<About>("/api/admin/about/portrait", fd);
      setAbout(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri uploadu portreta.");
    } finally {
      setPortraitBusy(false);
      setLocalPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageTitle title="O meni" subtitle="Uredi tekst i portret na About stranici." />
      {error && <ErrorBox message={error} />}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 space-y-4">
          <Field label="Naslov">
            <TextInput value={heading} onChange={(e) => setHeading(e.target.value)} />
          </Field>
          <Field label="Tekst" hint="Prazan red razdvaja pasuse.">
            <TextArea value={body} rows={12} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={saving}>{saving ? "Čuvanje…" : "Sačuvaj"}</Button>
            {saved && <span className="text-sm text-green-600">Sačuvano ✓</span>}
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="font-medium">Portret</p>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded bg-gray-100">
            {localPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={localPreview} alt="Pregled" className="h-full w-full object-cover" />
            ) : about?.portraitUrl ? (
              <Image src={about.portraitUrl} alt="Portret" fill sizes="220px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-400">Nema portreta</div>
            )}
            {portraitBusy && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white">
                Otpremam…
              </div>
            )}
          </div>

          <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50">
            {portraitBusy ? "Otpremam…" : about?.portraitUrl ? "Promijeni sliku" : "Izaberi sliku"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={portraitBusy}
              onChange={onPortraitChange}
            />
          </label>
          <p className="text-xs text-gray-400">Slika se otprema i prikazuje odmah po izboru.</p>
        </Card>
      </div>
    </div>
  );
}
