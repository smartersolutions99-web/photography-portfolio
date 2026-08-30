"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, ErrorBox, Field, PageTitle, Select, Spinner, TextArea, TextInput } from "@/components/admin/ui";
import { FeaturedPicker } from "@/components/admin/FeaturedPicker";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { apiGet, apiSend, apiUpload } from "@/lib/adminApi";
import type { Category, Photo } from "@/lib/types";

type FeaturedFilter = "all" | "featured" | "none";

export default function RadoviPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return photos.filter((p) => {
      if (q) {
        const haystack = `${p.title ?? ""} ${p.description ?? ""} ${p.categoryName ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (categoryFilter === "none") {
        if (p.categoryId != null) return false;
      } else if (categoryFilter) {
        if (String(p.categoryId) !== categoryFilter) return false;
      }
      if (featuredFilter === "featured" && !p.featured) return false;
      if (featuredFilter === "none" && p.featured) return false;
      return true;
    });
  }, [photos, search, categoryFilter, featuredFilter]);

  const isFiltered = search.trim() !== "" || categoryFilter !== "" || featuredFilter !== "all";

  function resetFilters() {
    setSearch("");
    setCategoryFilter("");
    setFeaturedFilter("all");
  }

  async function load() {
    try {
      const [p, c] = await Promise.all([
        apiGet<Photo[]>("/api/admin/photos"),
        apiGet<Category[]>("/api/admin/categories"),
      ]);
      setPhotos(p);
      setCategories(c);
    } catch {
      setError("Ne mogu učitati radove. Provjerite da li backend radi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleFeatured(photo: Photo) {
    const updated = await apiSend<Photo>(`/api/admin/photos/${photo.id}/featured`, "PATCH", {
      featured: !photo.featured,
    });
    setPhotos((prev) => prev.map((p) => (p.id === photo.id ? updated : p)));
  }

  async function remove(photo: Photo) {
    if (!confirm("Obrisati ovaj rad? Ova radnja je trajna.")) return;
    await apiSend(`/api/admin/photos/${photo.id}`, "DELETE");
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  }

  async function move(photoId: number, dir: -1 | 1) {
    const index = photos.findIndex((p) => p.id === photoId);
    const target = index + dir;
    if (index < 0 || target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    setPhotos(next);
    await apiSend("/api/admin/photos/order", "PUT", { orderedIds: next.map((p) => p.id) });
  }

  async function saveEdit(id: number, data: { title: string; description: string; categoryId: number | null; featured: boolean }) {
    const updated = await apiSend<Photo>(`/api/admin/photos/${id}`, "PUT", data);
    setPhotos((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  return (
    <div>
      <PageTitle
        title="Radovi"
        subtitle="Uploaduj, uredi i rasporedi fotografije."
        action={photos.length > 0 ? <FeaturedPicker photos={photos} onToggle={toggleFeatured} /> : undefined}
      />

      {error && <ErrorBox message={error} />}

      <UploadForm categories={categories} onUploaded={(p) => setPhotos((prev) => [...prev, p])} />

      {loading ? (
        <Spinner />
      ) : photos.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">Još nema radova. Uploaduj prvi iznad.</p>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Pretraga">
                <TextInput
                  placeholder="Pretraži po nazivu, opisu ili kategoriji…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Field>
            </div>
            <div className="sm:w-52">
              <Field label="Kategorija">
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="">Sve kategorije</option>
                  <option value="none">Bez kategorije</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="sm:w-44">
              <Field label="Istaknuto">
                <Select
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value as FeaturedFilter)}
                >
                  <option value="all">Sve</option>
                  <option value="featured">Samo istaknuto</option>
                  <option value="none">Bez istaknutih</option>
                </Select>
              </Field>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {filtered.length} od {photos.length} radova{isFiltered ? " (filtrirano)" : ""}
            </p>
            {isFiltered && (
              <button onClick={resetFilters} className="text-xs text-gray-500 underline hover:text-gray-900">
                Poništi filtere
              </button>
            )}
          </div>

          {isFiltered && (
            <p className="mt-1 text-xs text-gray-400">Raspoređivanje (↑↓) je dostupno samo bez filtera.</p>
          )}

          <div className="mt-3 space-y-3">
            {filtered.map((photo) => (
              <PhotoRow
                key={photo.id}
                photo={photo}
                categories={categories}
                reorderable={!isFiltered}
                onToggleFeatured={() => toggleFeatured(photo)}
                onDelete={() => remove(photo)}
                onMoveUp={() => move(photo.id, -1)}
                onMoveDown={() => move(photo.id, 1)}
                onSave={(data) => saveEdit(photo.id, data)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">Nema radova za ovaj izbor.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Pretvara ime fajla u naziv rada: bez ekstenzije, _/- u razmake, prvo slovo veliko. */
function fileNameToTitle(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "");
  const cleaned = base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function UploadForm({ categories, onUploaded }: { categories: Category[]; onUploaded: (p: Photo) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...imgs]);
    setErr(null);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setErr("Izaberite bar jednu sliku.");
      return;
    }
    setBusy(true);
    setErr(null);
    setDone(0);
    const failed: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const fd = new FormData();
        fd.append("file", files[i]);
        fd.append("title", fileNameToTitle(files[i].name));
        if (categoryId) fd.append("categoryId", String(categoryId));
        fd.append("featured", String(featured));
        const created = await apiUpload<Photo>("/api/admin/photos", fd);
        onUploaded(created);
      } catch {
        failed.push(files[i].name);
      }
      setDone(i + 1);
    }
    setBusy(false);
    setFiles([]);
    if (fileRef.current) fileRef.current.value = "";
    if (failed.length > 0) setErr(`Neuspješno (${failed.length}): ${failed.join(", ")}`);
  }

  const total = files.length;

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <p className="font-medium">Novi radovi</p>

        <div
          onClick={() => !busy && fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!busy) addFiles(e.dataTransfer.files);
          }}
          className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragOver ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <p className="text-sm font-medium">Prevuci slike ovdje ili klikni da izabereš</p>
          <p className="mt-1 text-xs text-gray-400">Možeš izabrati više fajlova odjednom</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {total > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">{total} izabrano</p>
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span key={`${f.name}-${i}`} className="flex items-center gap-2 rounded bg-gray-100 px-2 py-1 text-xs">
                  <span className="max-w-[160px] truncate">{f.name}</span>
                  {!busy && (
                    <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-600">
                      ✕
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kategorija (za sve)">
            <CategorySelect categories={categories} value={categoryId} onChange={setCategoryId} />
          </Field>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Sve istaknuto (featured)
          </label>
        </div>

        {busy && total > 0 && (
          <div>
            <div className="h-1.5 w-full overflow-hidden rounded bg-gray-200">
              <div className="h-full bg-gray-900 transition-all" style={{ width: `${(done / total) * 100}%` }} />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Upload {done}/{total}…
            </p>
          </div>
        )}

        {err && <ErrorBox message={err} />}

        <Button type="submit" disabled={busy || total === 0}>
          {busy ? `Upload… (${done}/${total})` : `Uploaduj${total ? ` (${total})` : ""}`}
        </Button>
      </form>
    </Card>
  );
}

function PhotoRow({
  photo,
  categories,
  reorderable = true,
  onToggleFeatured,
  onDelete,
  onMoveUp,
  onMoveDown,
  onSave,
}: {
  photo: Photo;
  categories: Category[];
  reorderable?: boolean;
  onToggleFeatured: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSave: (data: { title: string; description: string; categoryId: number | null; featured: boolean }) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(photo.title ?? "");
  const [description, setDescription] = useState(photo.description ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(photo.categoryId ?? null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await onSave({
        title,
        description,
        categoryId: categoryId,
        featured: photo.featured,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-gray-100">
          {photo.thumbnailUrl && (
            <Image src={photo.thumbnailUrl} alt={photo.title ?? ""} fill sizes="80px" className="object-cover" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {!editing ? (
            <>
              <p className="truncate font-medium">{photo.title || <span className="text-gray-400">Bez naziva</span>}</p>
              <p className="text-sm text-gray-500">{photo.categoryName ?? "Bez kategorije"}</p>
              {photo.featured && (
                <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Istaknuto</span>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <TextInput value={title} placeholder="Naziv" onChange={(e) => setTitle(e.target.value)} />
              <TextArea value={description} placeholder="Opis" rows={2} onChange={(e) => setDescription(e.target.value)} />
              <CategorySelect categories={categories} value={categoryId} onChange={setCategoryId} />
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          {reorderable && (
            <div className="flex gap-1">
              <Button variant="ghost" onClick={onMoveUp} title="Gore" className="px-2">↑</Button>
              <Button variant="ghost" onClick={onMoveDown} title="Dole" className="px-2">↓</Button>
            </div>
          )}
          {editing ? (
            <div className="flex gap-1">
              <Button variant="secondary" onClick={() => setEditing(false)}>Otkaži</Button>
              <Button onClick={save} disabled={saving}>{saving ? "…" : "Sačuvaj"}</Button>
            </div>
          ) : (
            <div className="flex gap-1">
              <Button variant="secondary" onClick={onToggleFeatured}>
                {photo.featured ? "Ukloni ★" : "Istakni ★"}
              </Button>
              <Button variant="secondary" onClick={() => setEditing(true)}>Uredi</Button>
              <Button variant="danger" onClick={onDelete}>Obriši</Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
