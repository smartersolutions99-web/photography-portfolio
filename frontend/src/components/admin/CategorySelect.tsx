"use client";

import type { Category } from "@/lib/types";
import { Select } from "./ui";

/**
 * Kaskadni izbor kategorije: prvi dropdown = glavne kategorije;
 * kada se izabere kategorija koja ima potkategorije, pojavljuje se drugi
 * dropdown sa potkategorijama te kategorije. Rezultat je jedan categoryId
 * (potkategorija ako je izabrana, inače sama glavna kategorija).
 */
export function CategorySelect({
  categories,
  value,
  onChange,
  noneLabel = "Bez kategorije",
}: {
  categories: Category[];
  value: number | null;
  onChange: (categoryId: number | null) => void;
  noneLabel?: string;
}) {
  const parents = categories.filter((c) => !c.parentId);
  const selected = value != null ? categories.find((c) => c.id === value) ?? null : null;
  // Ako je izabrana potkategorija -> roditelj; ako je glavna -> ona sama
  const parentId = selected ? selected.parentId ?? selected.id : null;
  const parentName = parents.find((p) => p.id === parentId)?.name ?? "";
  const subs = parentId != null ? categories.filter((c) => c.parentId === parentId) : [];
  const subValue = selected && selected.parentId ? String(selected.id) : "";

  return (
    <div className="space-y-2">
      <Select
        value={parentId ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">{noneLabel}</option>
        {parents.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>

      {subs.length > 0 && (
        <Select
          value={subValue}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : parentId)}
        >
          <option value="">— cijela „{parentName}" —</option>
          {subs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}
