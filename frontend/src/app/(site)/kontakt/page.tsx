import { BlurImage } from "@/components/site/BlurImage";
import { InlineContactForm } from "@/components/site/InlineContactForm";
import { Reveal } from "@/components/site/Reveal";
import { getContact, getHome, getPhotos } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Kontakt",
  description: "Stupi u kontakt — provjeri dostupnost termina i zatraži ponudu za tvoj događaj.",
  path: "/kontakt",
});

export default async function ContactPage() {
  const [contact, home, photos] = await Promise.all([getContact(), getHome(), getPhotos()]);
  const image = home.heroUrl ?? home.featured[0]?.url ?? photos[0]?.url ?? null;

  return (
    <section className="px-5 pb-24 pt-32 md:px-10 md:pb-40 md:pt-48">
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="mb-16 md:mb-24">
          <p className="eyebrow">Stupimo u kontakt</p>
          <h1 className="display-caps mt-4 text-5xl leading-[0.95] md:text-8xl">Kontakt</h1>
          <p className="prose-editorial mt-6">
            Recite mi nešto o svom danu — provjerićemo dostupnost termina i dogovoriti sve detalje.
          </p>
        </Reveal>

        <div className="grid gap-14 md:grid-cols-12 md:gap-16">
          {/* Lijevo: atmosferska fotografija + detalji */}
          <Reveal className="md:col-span-5">
            {image && (
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-line/40">
                <BlurImage
                  src={image}
                  alt="Atmosfera studija"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="mt-10 space-y-8">
              {contact.email && (
                <ContactItem label="Email">
                  <a href={`mailto:${contact.email}`} className="link-underline">
                    {contact.email}
                  </a>
                </ContactItem>
              )}
              {contact.phone && <ContactItem label="Telefon">{contact.phone}</ContactItem>}
              {contact.location && <ContactItem label="Lokacija">{contact.location}</ContactItem>}
              <div className="flex gap-6 pt-2">
                {contact.instagramUrl && (
                  <a href={contact.instagramUrl} target="_blank" rel="noreferrer" className="eyebrow !text-ink hover:!text-accent">
                    Instagram
                  </a>
                )}
                {contact.facebookUrl && (
                  <a href={contact.facebookUrl} target="_blank" rel="noreferrer" className="eyebrow !text-ink hover:!text-accent">
                    Facebook
                  </a>
                )}
              </div>
            </div>
          </Reveal>

          {/* Desno: forma */}
          <Reveal className="md:col-span-6 md:col-start-7" delay={0.1}>
            <div className="border border-line bg-surface/60 px-6 py-14 md:px-10">
              <InlineContactForm />
            </div>
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
