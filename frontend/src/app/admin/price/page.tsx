"use client";

import { useEffect, useState } from "react";
import { Button, Card, ErrorBox, Field, PageTitle, Spinner, TextArea, TextInput } from "@/components/admin/ui";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { apiGet, apiSend } from "@/lib/adminApi";
import type { Photo, Story } from "@/lib/types";

const ACCENT_SWATCHES = ["#9A7B4F", "#A9633F", "#6E7A5E", "#5C7A8A"];

type StoryInput = { title: string; text: string; photoId: number | null; accentColor: string };

export default function PricePage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [s, p] = await Promise.all([
        apiGet<Story[]>("/api/admin/stories"),
        apiGet<Photo[]>("/api/admin/photos"),
      ]);
      setStories([...s].sort((a, b) => a.displayOrder - b.displayOrder));
      setPhotos(p);
    } catch {
      setError("Ne mogu učitati priče. Provjerite da li backend radi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(data: StoryInput) {
    const created = await apiSend<Story>("/api/admin/stories", "POST", data);
    setStories((prev) => [...prev, created]);
  }

  async function update(id: number, data: StoryInput) {
    const updated = await apiSend<Story>(`/api/admin/stories/${id}`, "PUT", data);
    setStories((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  async function remove(story: Story) {
    if (!confirm(`Obrisati priču "${story.title}"?`)) return;
    await apiSend(`/api/admin/stories/${story.id}`, "DELETE");
    setStories((prev) => prev.filter((s) => s.id !== story.id));
  }

  async function applyOrder(ordered: Story[]) {
    const orderMap = new Map(ordered.map((s, i) => [s.id, i]));
    setStories((prev) =>
      [...prev]
        .map((s) => ({ ...s, displayOrder: orderMap.get(s.id) ?? s.displayOrder }))
        .sort((a, b) => a.displayOrder - b.displayOrder),
    );
    await apiSend(
      "/api/admin/stories/order",
      "PUT",
      { orderedIds: ordered.map((s) => s.id) },
    );
  }

  function move(id: number, dir: -1 | 1) {
    const ordered = [...stories].sort((a, b) => a.displayOrder - b.displayOrder);
    const i = ordered.findIndex((s) => s.id === id);
    const t = i + dir;
    if (t < 0 || t >= ordered.length) return;
    [ordered[i], ordered[t]] = [ordered[t], ordered[i]];
    applyOrder(ordered);
  }

  return (
    <div>
      <PageTitle
        title="Naše priče"
        subtitle="Tri (ili više) istaknute priče u sekciji 'Naše zajedničke priče' na početnoj."
      />
      {error && <ErrorBox message={error} />}

      <CreateForm photos={photos} onCreate={create} />

      {loading ? (
        <Spinner />
      ) : stories.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">Još nema priča.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {[...stories]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((story) => (
              <StoryRow
                key={story.id}
                story={story}
                photos={photos}
                onUpdate={(data) => update(story.id, data)}
                onDelete={() => remove(story)}
                onMoveUp={() => move(story.id, -1)}
                onMoveDown={() => move(story.id, 1)}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function AccentPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#9A7B4F"}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-9 flex-shrink-0 cursor-pointer rounded border border-gray-300 p-0.5"
        aria-label="Boja akcenta"
      />
      <TextInput value={value} onChange={(e) => onChange(e.target.value)} placeholder="#9A7B4F" className="max-w-[9rem]" />
      <div className="flex gap-1">
        {ACCENT_SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            style={{ backgroundColor: c }}
            className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
              value.toLowerCase() === c.toLowerCase() ? "border-gray-900" : "border-white"
            }`}
            aria-label={`Izaberi boju ${c}`}
          />
        ))}
      </div>
    </div>
  );
}

function CreateForm({ photos, onCreate }: { photos: Photo[]; onCreate: (data: StoryInput) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [photoId, setPhotoId] = useState<number | null>(null);
  const [accentColor, setAccentColor] = useState(ACCENT_SWATCHES[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await onCreate({ title: title.trim(), text: text.trim(), photoId, accentColor });
      setTitle("");
      setText("");
      setPhotoId(null);
      setAccentColor(ACCENT_SWATCHES[0]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Greška.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <p className="font-medium">Nova priča</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Naslov">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="npr. Venčanje u vinogradu" />
          </Field>
          <Field label="Boja akcenta">
            <AccentPicker value={accentColor} onChange={setAccentColor} />
          </Field>
        </div>
        <Field label="Kratak tekst priče">
          <TextArea rows={3} value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <Field label="Fotografija" hint="Ako ne izabereš sliku, koristiće se jedan od istaknutih radova.">
          <ImagePicker photos={photos} value={photoId} onChange={setPhotoId} buttonLabel="Izaberi sliku" />
        </Field>
        {err && <ErrorBox message={err} />}
        <Button type="submit" disabled={busy}>
          {busy ? "…" : "Dodaj priču"}
        </Button>
      </form>
    </Card>
  );
}

function StoryRow({
  story,
  photos,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  story: Story;
  photos: Photo[];
  onUpdate: (data: StoryInput) => Promise<void>;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(story.title);
  const [text, setText] = useState(story.text);
  const [photoId, setPhotoId] = useState<number | null>(story.photoId);
  const [accentColor, setAccentColor] = useState(story.accentColor);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await onUpdate({ title: title.trim(), text: text.trim(), photoId, accentColor });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setTitle(story.title);
    setText(story.text);
    setPhotoId(story.photoId);
    setAccentColor(story.accentColor);
    setEditing(false);
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded bg-gray-100 bg-cover bg-center"
            style={story.imageUrl ? { backgroundImage: `url(${story.imageUrl})` } : undefined}
          />

          <div className="min-w-0 flex-1">
            {!editing ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 flex-shrink-0 rounded-full border border-black/10" style={{ backgroundColor: story.accentColor }} />
                  <p className="font-medium">{story.title}</p>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{story.text}</p>
              </>
            ) : (
              <div className="space-y-3">
                <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
                <TextArea value={text} rows={3} onChange={(e) => setText(e.target.value)} />
                <Field label="Boja akcenta">
                  <AccentPicker value={accentColor} onChange={setAccentColor} />
                </Field>
                <Field label="Fotografija">
                  <ImagePicker photos={photos} value={photoId} onChange={setPhotoId} buttonLabel="Izaberi sliku" />
                </Field>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:flex-col sm:items-end">
          <div className="flex gap-1">
            <Button variant="ghost" onClick={onMoveUp} className="px-2">↑</Button>
            <Button variant="ghost" onClick={onMoveDown} className="px-2">↓</Button>
          </div>
          {editing ? (
            <div className="flex gap-1">
              <Button variant="secondary" onClick={cancel}>Otkaži</Button>
              <Button onClick={save} disabled={saving}>{saving ? "…" : "Sačuvaj"}</Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              <Button variant="secondary" onClick={() => setEditing(true)}>Uredi</Button>
              <Button variant="danger" onClick={onDelete}>Obriši</Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
