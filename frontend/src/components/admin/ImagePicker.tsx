"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Photo } from "@/lib/types";
import { Button } from "./ui";

/**
 * Vizuelni izbor slike iz galerije radova (umjesto dropdown liste po imenu).
 * Prikazuje trenutni izbor kao thumbnail + dugme koje otvara modal sa svim radovima.
 */
export function ImagePicker({
  photos,
  value,
  onChange,
  allowClear = true,
  buttonLabel = "Izaberi sliku",
  emptyText = "Nema dostupnih radova.",
}: {
  photos: Photo[];
  value: number | null;
  onChange: (id: number | null) => void;
  allowClear?: boolean;
  buttonLabel?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selected = photos.find((p) => p.id === value) ?? null;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return photos;
    return photos.filter((p) => `${p.title ?? ""} ${p.categoryName ?? ""}`.toLowerCase().includes(s));
  }, [photos, q]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-100">
          {selected?.thumbnailUrl && (
            <Image src={selected.thumbnailUrl} alt={selected.title ?? ""} fill sizes="64px" className="object-cover" />
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
            {selected ? "Promijeni" : buttonLabel}
          </Button>
          {allowClear && selected && (
            <Button type="button" variant="ghost" onClick={() => onChange(null)}>
              Ukloni
            </Button>
          )}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-4">
              <input
                autoFocus
                placeholder="Pretraži po nazivu ili kategoriji…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full max-w-xs rounded border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-gray-900"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xl leading-none text-gray-400 hover:text-gray-900"
                aria-label="Zatvori"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-4">
              {filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">{emptyText}</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {filtered.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onChange(p.id);
                        setOpen(false);
                      }}
                      className={`group relative aspect-square overflow-hidden rounded border-2 transition-colors ${
                        value === p.id ? "border-gray-900" : "border-transparent hover:border-gray-400"
                      }`}
                    >
                      {p.thumbnailUrl && (
                        <Image
                          src={p.thumbnailUrl}
                          alt={p.title ?? ""}
                          fill
                          sizes="150px"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      )}
                      {p.title && (
                        <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
                          {p.title}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
