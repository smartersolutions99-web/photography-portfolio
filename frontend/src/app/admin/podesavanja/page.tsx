"use client";

import { useEffect, useState } from "react";
import { Button, Card, ErrorBox, Field, PageTitle, Spinner, TextArea, TextInput } from "@/components/admin/ui";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { apiGet, apiSend } from "@/lib/adminApi";
import type { Photo, SiteSettings } from "@/lib/types";

type Form = Omit<SiteSettings, "heroUrl">;

const EMPTY: Form = {
  siteName: "",
  tagline: "",
  email: "",
  phone: "",
  address: "",
  location: "",
  instagramUrl: "",
  facebookUrl: "",
  heroTitle: "",
  heroSubtitle: "",
  heroPhotoId: null,
  pressQuote: "",
  pressSource: "",
  editorialStatement: "",
  seoTitle: "",
  seoDescription: "",
};

export default function PodesavanjaPage() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, p] = await Promise.all([
          apiGet<SiteSettings>("/api/admin/site-settings"),
          apiGet<Photo[]>("/api/admin/photos"),
        ]);
        const { heroUrl, ...rest } = s;
        setForm({ ...EMPTY, ...rest });
        setPhotos(p);
      } catch {
        setError("Ne mogu učitati podešavanja. Provjerite da li backend radi.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await apiSend<SiteSettings>("/api/admin/site-settings", "PUT", form);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Greška.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  const t = (k: keyof Form) => (form[k] as string) ?? "";

  return (
    <div>
      <PageTitle
        title="Podešavanja sajta"
        subtitle="Naziv, hero početne, kontakt i editorial tekstovi."
        action={
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm text-green-600">Sačuvano ✓</span>}
            <Button onClick={save} disabled={saving}>{saving ? "Čuvanje…" : "Sačuvaj sve"}</Button>
          </div>
        }
      />
      {error && <ErrorBox message={error} />}

      <div className="space-y-6">
        <Card className="space-y-4">
          <p className="font-medium">Opšte</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Naziv sajta / logo">
              <TextInput value={t("siteName")} onChange={(e) => set("siteName", e.target.value)} />
            </Field>
            <Field label="Slogan">
              <TextInput value={t("tagline")} onChange={(e) => set("tagline", e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="font-medium">Hero (početna)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hero naslov">
              <TextInput value={t("heroTitle")} onChange={(e) => set("heroTitle", e.target.value)} />
            </Field>
            <Field label="Hero podnaslov">
              <TextInput value={t("heroSubtitle")} onChange={(e) => set("heroSubtitle", e.target.value)} />
            </Field>
          </div>
          <Field label="Hero slika" hint="Velika slika na vrhu početne. Ako nije izabrana, koristi se prvi featured rad.">
            <ImagePicker
              photos={photos}
              value={form.heroPhotoId ?? null}
              onChange={(id) => set("heroPhotoId", id)}
              buttonLabel="Izaberi hero sliku"
            />
          </Field>
        </Card>

        <Card className="space-y-4">
          <p className="font-medium">Kontakt</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email"><TextInput value={t("email")} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Telefon"><TextInput value={t("phone")} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Adresa"><TextInput value={t("address")} onChange={(e) => set("address", e.target.value)} /></Field>
            <Field label="Lokacija (npr. Crna Gora)"><TextInput value={t("location")} onChange={(e) => set("location", e.target.value)} /></Field>
            <Field label="Instagram URL"><TextInput value={t("instagramUrl")} onChange={(e) => set("instagramUrl", e.target.value)} /></Field>
            <Field label="Facebook URL"><TextInput value={t("facebookUrl")} onChange={(e) => set("facebookUrl", e.target.value)} /></Field>
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="font-medium">Editorial tekstovi (početna)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Citat / recenzija"><TextArea rows={3} value={t("pressQuote")} onChange={(e) => set("pressQuote", e.target.value)} /></Field>
            <Field label="Izvor citata"><TextInput value={t("pressSource")} onChange={(e) => set("pressSource", e.target.value)} /></Field>
          </div>
          <Field label="Editorial izjava"><TextArea rows={3} value={t("editorialStatement")} onChange={(e) => set("editorialStatement", e.target.value)} /></Field>
        </Card>

        <Card className="space-y-4">
          <p className="font-medium">SEO</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SEO naslov"><TextInput value={t("seoTitle")} onChange={(e) => set("seoTitle", e.target.value)} /></Field>
            <Field label="SEO opis"><TextInput value={t("seoDescription")} onChange={(e) => set("seoDescription", e.target.value)} /></Field>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving}>{saving ? "Čuvanje…" : "Sačuvaj sve"}</Button>
          {saved && <span className="text-sm text-green-600">Sačuvano ✓</span>}
        </div>
      </div>
    </div>
  );
}
