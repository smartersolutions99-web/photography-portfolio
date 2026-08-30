"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, ErrorBox, PageTitle } from "@/components/admin/ui";
import { apiGet } from "@/lib/adminApi";
import type { Category, Photo } from "@/lib/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<{ photos: number; featured: number; categories: number; unread: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [photos, categories, unread] = await Promise.all([
          apiGet<Photo[]>("/api/admin/photos"),
          apiGet<Category[]>("/api/admin/categories"),
          apiGet<{ count: number }>("/api/admin/contact-messages/unread-count"),
        ]);
        setStats({
          photos: photos.length,
          featured: photos.filter((p) => p.featured).length,
          categories: categories.length,
          unread: unread.count,
        });
      } catch (e) {
        setError("Ne mogu učitati podatke. Provjerite da li backend radi.");
      }
    })();
  }, []);

  return (
    <div>
      <PageTitle title="Pregled" subtitle="Dobrodošli u administraciju portfolija." />

      {error && <ErrorBox message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Radovi" value={stats?.photos} href="/admin/radovi" />
        <Stat label="Istaknuti" value={stats?.featured} href="/admin/radovi" />
        <Stat label="Kategorije" value={stats?.categories} href="/admin/kategorije" />
        <Stat label="Nove poruke" value={stats?.unread} href="/admin/poruke" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Quick href="/admin/radovi" title="Dodaj rad" text="Uploaduj nove fotografije i rasporedi ih." />
        <Quick href="/admin/kategorije" title="Uredi kategorije" text="Kreiraj kategorije i postavi cover slike." />
        <Quick href="/admin/podesavanja" title="Podešavanja sajta" text="Hero, kontakt i tekstovi početne." />
        <Quick href="/admin/o-nama" title="O meni" text="Uredi tekst i portret." />
      </div>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value?: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-sm">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold">{value ?? "—"}</p>
      </Card>
    </Link>
  );
}

function Quick({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-sm">
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{text}</p>
      </Card>
    </Link>
  );
}
