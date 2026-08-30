"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button, Card, ErrorBox, Field, PageTitle, Select, Spinner, TextArea, TextInput } from "@/components/admin/ui";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { apiGet, apiSend } from "@/lib/adminApi";
import type { Category, Photo } from "@/lib/types";

const byOrder = (a: Category, b: Category) =>
  (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name);

export default function KategorijePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [c, p] = await Promise.all([
        apiGet<Category[]>("/api/admin/categories"),
        apiGet<Photo[]>("/api/admin/photos"),
      ]);
      setCategories(c);
      setPhotos(p);
    } catch {
      setError("Ne mogu učitati kategorije. Provjerite da li backend radi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(name: string, description: string, parentId: number | null) {
    const created = await apiSend<Category>("/api/admin/categories", "POST", { name, description, parentId });
    setCategories((prev) => [...prev, created]);
  }

  async function update(id: number, data: { name: string; description: string; parentId: number | null }) {
    const updated = await apiSend<Category>(`/api/admin/categories/${id}`, "PUT", data);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  async function remove(cat: Category) {
    if (!confirm(`Obrisati kategoriju "${cat.name}"? Radovi ostaju, ali bez kategorije.`)) return;
    await apiSend(`/api/admin/categories/${cat.id}`, "DELETE");
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
  }

  async function setCover(id: number, photoId: number | null) {
    const updated = await apiSend<Category>(`/api/admin/categories/${id}/cover`, "PUT", { photoId });
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  async function applyOrder(orderedIds: number[]) {
    const orderMap = new Map(orderedIds.map((id, i) => [id, i]));
    setCategories((prev) =>
      prev.map((c) => ({ ...c, displayOrder: orderMap.get(c.id) ?? c.displayOrder })),
    );
    await apiSend("/api/admin/categories/order", "PUT", { orderedIds });
  }

  function groupedIds(orderedParents: Category[], swapChild?: { parentId: number; from: number; to: number }): number[] {
    const ids: number[] = [];
    for (const p of orderedParents) {
      ids.push(p.id);
      let kids = categories.filter((c) => c.parentId === p.id).sort(byOrder);
      if (swapChild && swapChild.parentId === p.id) {
        kids = [...kids];
        [kids[swapChild.from], kids[swapChild.to]] = [kids[swapChild.to], kids[swapChild.from]];
      }
      for (const ch of kids) ids.push(ch.id);
    }
    // sigurnosno: dodaj eventualne preostale
    for (const c of categories) if (!ids.includes(c.id)) ids.push(c.id);
    return ids;
  }

  function moveParent(parentId: number, dir: -1 | 1) {
    const ps = categories.filter((c) => !c.parentId).sort(byOrder);
    const i = ps.findIndex((p) => p.id === parentId);
    const t = i + dir;
    if (t < 0 || t >= ps.length) return;
    [ps[i], ps[t]] = [ps[t], ps[i]];
    applyOrder(groupedIds(ps));
  }

  function moveChild(childId: number, dir: -1 | 1) {
    const child = categories.find((c) => c.id === childId);
    if (!child || !child.parentId) return;
    const siblings = categories.filter((c) => c.parentId === child.parentId).sort(byOrder);
    const i = siblings.findIndex((c) => c.id === childId);
    const t = i + dir;
    if (t < 0 || t >= siblings.length) return;
    const ps = categories.filter((c) => !c.parentId).sort(byOrder);
    applyOrder(groupedIds(ps, { parentId: child.parentId, from: i, to: t }));
  }

  const parents = categories.filter((c) => !c.parentId).sort(byOrder);

  return (
    <div>
      <PageTitle title="Kategorije" subtitle="Kreiraj kategorije, potkategorije i postavi cover slike." />
      {error && <ErrorBox message={error} />}

      <CreateForm parents={parents} onCreate={create} />

      {loading ? (
        <Spinner />
      ) : categories.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">Još nema kategorija.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {parents.map((parent) => (
            <ParentGroup
              key={parent.id}
              parent={parent}
              childCats={categories.filter((c) => c.parentId === parent.id).sort(byOrder)}
              parents={parents}
              photos={photos}
              onUpdate={update}
              onDelete={remove}
              onSetCover={setCover}
              onMoveParent={moveParent}
              onMoveChild={moveChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ParentGroup({
  parent,
  childCats,
  parents,
  photos,
  onUpdate,
  onDelete,
  onSetCover,
  onMoveParent,
  onMoveChild,
}: {
  parent: Category;
  childCats: Category[];
  parents: Category[];
  photos: Photo[];
  onUpdate: (id: number, data: { name: string; description: string; parentId: number | null }) => Promise<void>;
  onDelete: (cat: Category) => void;
  onSetCover: (id: number, photoId: number | null) => Promise<void>;
  onMoveParent: (id: number, dir: -1 | 1) => void;
  onMoveChild: (id: number, dir: -1 | 1) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <CategoryRow
        category={parent}
        parents={parents}
        photos={photos}
        onUpdate={(data) => onUpdate(parent.id, data)}
        onDelete={() => onDelete(parent)}
        onSetCover={(photoId) => onSetCover(parent.id, photoId)}
        onMoveUp={() => onMoveParent(parent.id, -1)}
        onMoveDown={() => onMoveParent(parent.id, 1)}
      />

      {childCats.length > 0 && (
        <div className="ml-5 mt-3 border-l-2 border-gray-200 pl-4">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900"
          >
            <span className="inline-block w-3">{collapsed ? "▸" : "▾"}</span>
            Potkategorije ({childCats.length}) {collapsed ? "— prikaži" : "— sakrij"}
          </button>
          {!collapsed && (
            <div className="space-y-3">
              {childCats.map((child) => (
                <CategoryRow
                  key={child.id}
                  category={child}
                  parents={parents}
                  photos={photos}
                  onUpdate={(data) => onUpdate(child.id, data)}
                  onDelete={() => onDelete(child)}
                  onSetCover={(photoId) => onSetCover(child.id, photoId)}
                  onMoveUp={() => onMoveChild(child.id, -1)}
                  onMoveDown={() => onMoveChild(child.id, 1)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateForm({
  parents,
  onCreate,
}: {
  parents: Category[];
  onCreate: (name: string, description: string, parentId: number | null) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await onCreate(name.trim(), description.trim(), parentId ? Number(parentId) : null);
      setName("");
      setDescription("");
      setParentId("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Greška.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <p className="font-medium">Nova kategorija</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Naziv">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="npr. Vjenčanja" />
          </Field>
          <Field label="Opis (opciono)">
            <TextInput value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Nadkategorija (opciono)">
            <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">— glavna kategorija —</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {err && <ErrorBox message={err} />}
        <Button type="submit" disabled={busy}>
          {busy ? "…" : "Dodaj kategoriju"}
        </Button>
      </form>
    </Card>
  );
}

function CategoryRow({
  category,
  parents,
  photos,
  onUpdate,
  onDelete,
  onSetCover,
  onMoveUp,
  onMoveDown,
}: {
  category: Category;
  parents: Category[];
  photos: Photo[];
  onUpdate: (data: { name: string; description: string; parentId: number | null }) => Promise<void>;
  onDelete: () => void;
  onSetCover: (photoId: number | null) => Promise<void>;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? "");
  const [parentId, setParentId] = useState(category.parentId ? String(category.parentId) : "");
  const [saving, setSaving] = useState(false);

  const catPhotos = photos.filter((p) => p.categoryId === category.id);
  const isSub = !!category.parentId;
  const parentOptions = parents.filter((p) => p.id !== category.id);

  async function save() {
    setSaving(true);
    try {
      await onUpdate({ name, description, parentId: parentId ? Number(parentId) : null });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="flex min-w-0 flex-1 gap-4">
        <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded bg-gray-100">
          {category.coverUrl && (
            <Image src={category.coverUrl} alt={category.name} fill sizes="112px" className="object-cover" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {!editing ? (
            <>
              <div className="flex items-center gap-2">
                <p className="font-medium">{category.name}</p>
                {isSub && (
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">potkategorija</span>
                )}
              </div>
              <p className="text-sm text-gray-500">/{category.slug} · {category.photoCount} radova</p>
              {category.description && <p className="mt-1 text-sm text-gray-500">{category.description}</p>}
            </>
          ) : (
            <div className="space-y-2">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} />
              <TextArea value={description} rows={2} onChange={(e) => setDescription(e.target.value)} />
              <Field label="Nadkategorija">
                <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
                  <option value="">— glavna kategorija —</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          )}
          <div className="mt-3">
            <Field label="Cover slika">
              <ImagePicker
                photos={catPhotos}
                value={category.coverPhotoId ?? null}
                onChange={(id) => onSetCover(id)}
                buttonLabel="Izaberi cover"
                emptyText="Ova kategorija još nema radova."
              />
            </Field>
          </div>
        </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:flex-col sm:items-end">
          <div className="flex gap-1">
            <Button variant="ghost" onClick={onMoveUp} className="px-2">↑</Button>
            <Button variant="ghost" onClick={onMoveDown} className="px-2">↓</Button>
          </div>
          {editing ? (
            <div className="flex gap-1">
              <Button variant="secondary" onClick={() => setEditing(false)}>Otkaži</Button>
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
