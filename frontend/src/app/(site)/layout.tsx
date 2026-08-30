import { Cursor } from "@/components/site/Cursor";
import { Footer } from "@/components/site/Footer";
import { Grain } from "@/components/site/Grain";
import { Header } from "@/components/site/Header";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { getContact } from "@/lib/api";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const contact = await getContact();
  return (
    <SmoothScroll>
      <ScrollProgress />
      <Grain />
      <Cursor />
      <div className="flex min-h-screen flex-col">
        <Header siteName={contact.siteName ?? "STUDIO"} contact={contact} />
        <main className="flex-1">{children}</main>
        <Footer contact={contact} />
      </div>
    </SmoothScroll>
  );
}
