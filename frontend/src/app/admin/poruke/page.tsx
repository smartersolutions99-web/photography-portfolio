"use client";

import { useEffect, useState } from "react";
import { Button, Card, ErrorBox, PageTitle, Spinner } from "@/components/admin/ui";
import { apiGet, apiSend } from "@/lib/adminApi";
import type { ContactMessage } from "@/lib/types";

export default function PorukePage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setMessages(await apiGet<ContactMessage[]>("/api/admin/contact-messages"));
      } catch {
        setError("Ne mogu učitati poruke. Provjerite da li backend radi.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function markRead(m: ContactMessage) {
    const updated = await apiSend<ContactMessage>(`/api/admin/contact-messages/${m.id}/read`, "PATCH");
    setMessages((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
  }

  async function remove(m: ContactMessage) {
    if (!confirm("Obrisati poruku?")) return;
    await apiSend(`/api/admin/contact-messages/${m.id}`, "DELETE");
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageTitle title="Poruke" subtitle="Poruke pristigle sa kontakt forme." />
      {error && <ErrorBox message={error} />}

      {messages.length === 0 ? (
        <p className="text-sm text-gray-500">Nema poruka.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id} className={m.read ? "" : "border-gray-900"}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{m.name}</p>
                    {!m.read && <span className="rounded bg-gray-900 px-2 py-0.5 text-xs text-white">Novo</span>}
                  </div>
                  <a href={`mailto:${m.email}`} className="text-sm text-blue-600 hover:underline">{m.email}</a>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{m.message}</p>
                  <p className="mt-2 text-xs text-gray-400">{new Date(m.createdAt).toLocaleString("sr-Latn")}</p>
                </div>
                <div className="flex flex-shrink-0 flex-col gap-1">
                  {!m.read && <Button variant="secondary" onClick={() => markRead(m)}>Pročitano</Button>}
                  <Button variant="danger" onClick={() => remove(m)}>Obriši</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
