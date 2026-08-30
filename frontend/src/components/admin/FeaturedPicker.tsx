"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Photo } from "@/lib/types";
import { Button } from "./ui";

/**
 * Modal za vizuelni izbor istaknutih (featured) radova — klik na sliku
 * dodaje/uklanja rad sa početne stranice. Višestruki izbor.
 */
export function FeaturedPicker({
  photos,
  onToggle,
}: {
  photos: Photo[];
  onToggle: (photo: Photo) => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const featuredCount = photos.filter((p) => p.featured).length;

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

  async function toggle(p: Photo) {
    setBusyId(p.id);
    try {
      await onToggle(p);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        ★ Istaknuti ({featuredCount})
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-4">
              <div className="min-w-0">
                <p className="font-medium">Istaknuti radovi</p>
                <p className="text-xs text-gray-500">
                  Klikni sliku da je dodaš/ukloniš sa početne. {featuredCount} istaknuto.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  placeholder="Pretraži…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-36 rounded border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-gray-900 sm:w-48"
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
            </div>

            <div className="overflow-y-auto p-4">
              {filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">Nema radova.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {filtered.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggle(p)}
                      disabled={busyId === p.id}
                      className={`group relative aspect-square overflow-hidden rounded border-2 transition-colors ${
                        p.featured ? "border-amber-500" : "border-transparent hover:border-gray-400"
                      }`}
                    >
                      {p.thumbnailUrl && (
                        <Image
                          src={p.thumbnailUrl}
                          alt={p.title ?? ""}
                          fill
                          sizes="150px"
                          className={`object-cover transition ${p.featured ? "" : "opacity-80 group-hover:opacity-100"}`}
                        />
                      )}
                      {p.featured && (
                        <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs text-white shadow">
                          ★
                        </span>
                      )}
                      {busyId === p.id && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">
                          …
                        </span>
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

            <div className="border-t border-gray-200 p-4 text-right">
              <Button type="button" onClick={() => setOpen(false)}>
                Gotovo
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
