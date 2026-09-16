"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Pregled" },
  { href: "/admin/radovi", label: "Radovi" },
  { href: "/admin/kategorije", label: "Kategorije" },
  { href: "/admin/price", label: "Naše priče" },
  { href: "/admin/o-nama", label: "O meni" },
  { href: "/admin/podesavanja", label: "Podešavanja" },
  { href: "/admin/poruke", label: "Poruke" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function logout() {
    clearToken();
    router.push("/admin/login");
  }

  const sidebar = (
    <>
      <div>
        <div className="border-b border-gray-200 px-5 py-5">
          <p className="text-sm font-semibold tracking-wide">ADMIN</p>
          <p className="text-xs text-gray-500">Portfolio fotografa</p>
        </div>
        <nav className="flex flex-col p-2">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-2 text-sm transition-colors ${
                  active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-2">
        <Link
          href="/"
          target="_blank"
          className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          ↗ Pogledaj sajt
        </Link>
        <button
          onClick={logout}
          className="w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        >
          Odjava
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      {/* Desktop bočni meni */}
      <aside className="hidden w-56 flex-shrink-0 flex-col justify-between border-r border-gray-200 bg-white md:flex">
        {sidebar}
      </aside>

      {/* Mobilni drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 max-w-[80vw] flex-col justify-between border-r border-gray-200 bg-white shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobilna gornja traka */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <div>
            <p className="text-sm font-semibold tracking-wide">ADMIN</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Otvori meni"
            className="flex h-9 w-9 items-center justify-center rounded border border-gray-300 text-gray-700"
          >
            <span className="flex flex-col gap-[3px]">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </span>
          </button>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-5xl p-4 sm:p-6 md:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
