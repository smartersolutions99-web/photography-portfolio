"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Pregled" },
  { href: "/admin/radovi", label: "Radovi" },
  { href: "/admin/kategorije", label: "Kategorije" },
  { href: "/admin/o-nama", label: "O meni" },
  { href: "/admin/podesavanja", label: "Podešavanja" },
  { href: "/admin/poruke", label: "Poruke" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearToken();
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <aside className="flex w-56 flex-col justify-between border-r border-gray-200 bg-white">
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
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
