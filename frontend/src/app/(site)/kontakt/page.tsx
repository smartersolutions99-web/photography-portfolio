import { ContactForm } from "@/components/site/ContactForm";
import { Reveal } from "@/components/site/Reveal";
import { getContact } from "@/lib/api";

export const metadata = {
  title: "Kontakt — Studio",
};

export default async function ContactPage() {
  const contact = await getContact();

  return (
    <section className="px-5 pb-24 pt-32 md:px-10 md:pb-36 md:pt-48">
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="mb-16 md:mb-24">
          <p className="eyebrow">Stupimo u kontakt</p>
          <h1 className="display-serif mt-3 text-5xl md:text-8xl">Razgovarajmo</h1>
        </Reveal>

        <div className="grid gap-16 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <div className="space-y-8">
              {contact.email && (
                <ContactItem label="Email">
                  <a href={`mailto:${contact.email}`} className="link-underline">
                    {contact.email}
                  </a>
                </ContactItem>
              )}
              {contact.phone && <ContactItem label="Telefon">{contact.phone}</ContactItem>}
              {contact.location && <ContactItem label="Lokacija">{contact.location}</ContactItem>}
              {contact.address && <ContactItem label="Adresa">{contact.address}</ContactItem>}
              <div className="flex gap-6 pt-2">
                {contact.instagramUrl && (
                  <a href={contact.instagramUrl} target="_blank" rel="noreferrer" className="eyebrow !text-ink">
                    Instagram
                  </a>
                )}
                {contact.facebookUrl && (
                  <a href={contact.facebookUrl} target="_blank" rel="noreferrer" className="eyebrow !text-ink">
                    Facebook
                  </a>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal className="md:col-span-7 md:col-start-6" delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ContactItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="mt-1 text-lg">{children}</p>
    </div>
  );
}
