import { CameraIntro } from "@/components/site/CameraIntro";
import { Cursor } from "@/components/site/Cursor";
import { FloatingContact } from "@/components/site/FloatingContact";
import { Footer } from "@/components/site/Footer";
import { Grain } from "@/components/site/Grain";
import { Header } from "@/components/site/Header";
import { JsonLd } from "@/components/site/JsonLd";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { getContact, getHome } from "@/lib/api";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [contact, home] = await Promise.all([getContact(), getHome()]);
  const name = contact.siteName ?? SITE_NAME;
  // Ista slika koju kontakt hero koristi kao pozadinu — intro je „snima"
  const introImage = home.heroUrl ?? home.featured[0]?.url ?? null;

  // Structured data: WebSite + fotografski biznis (LocalBusiness/ProfessionalService).
  // undefined polja se izbacuju iz izlaza (JSON.stringify ih preskače).
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name,
        inLanguage: "sr-RS",
        description: contact.tagline ?? DEFAULT_DESCRIPTION,
      },
      {
        "@type": ["LocalBusiness", "ProfessionalService"],
        "@id": `${SITE_URL}/#business`,
        name,
        url: SITE_URL,
        image: home.heroUrl ?? undefined,
        description: contact.tagline ?? DEFAULT_DESCRIPTION,
        email: contact.email ?? undefined,
        telephone: contact.phone ?? undefined,
        areaServed: contact.location ?? undefined,
        address: contact.address
          ? { "@type": "PostalAddress", addressLocality: contact.address }
          : undefined,
        sameAs: [contact.instagramUrl, contact.facebookUrl].filter(Boolean),
      },
    ],
  };

  return (
    <SmoothScroll>
      <JsonLd data={jsonLd} />
      <CameraIntro imageUrl={introImage} />
      <ScrollProgress />
      <Grain />
      <Cursor />
      <FloatingContact />
      <div className="flex min-h-screen flex-col">
        <Header siteName={contact.siteName ?? "STUDIO"} contact={contact} />
        <main className="flex-1">{children}</main>
        <Footer contact={contact} />
      </div>
    </SmoothScroll>
  );
}
