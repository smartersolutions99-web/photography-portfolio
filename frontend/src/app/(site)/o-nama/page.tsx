import { BlurImage } from "@/components/site/BlurImage";
import { Reveal } from "@/components/site/Reveal";
import { getAbout, getPhotos } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "O meni",
  description: "Upoznaj fotografa iza objektiva — priča, pristup i stil rada.",
  path: "/o-nama",
});

export default async function AboutPage() {
  const [about, photos] = await Promise.all([getAbout(), getPhotos()]);
  const paragraphs = (about.body ?? "").split(/\n{2,}|\n/).filter((p) => p.trim().length > 0);
  const detail1 = photos[1]?.url ?? null;
  const detail2 = photos[3]?.url ?? null;

  return (
    <section className="px-5 pb-24 pt-32 md:px-10 md:pb-40 md:pt-48">
      <div className="mx-auto max-w-[1400px]">
        {/* Masthead */}
        <Reveal className="mb-16 md:mb-24">
          <p className="eyebrow">Upoznajmo se</p>
          <h1 className="display-caps mt-4 text-5xl leading-[0.95] md:text-8xl">{about.heading ?? "O meni"}</h1>
        </Reveal>

        {/* Profil: veliki portret + tekstualne kolone */}
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          {about.portraitUrl && (
            <Reveal className="md:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-line/40">
                <BlurImage
                  src={about.portraitUrl}
                  alt={about.heading ?? "Portret fotografa"}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              {detail1 && (
                <div className="relative mt-6 hidden aspect-[3/2] w-2/3 overflow-hidden bg-line/40 md:block">
                  <BlurImage src={detail1} alt="" fill sizes="30vw" className="object-cover" />
                </div>
              )}
            </Reveal>
          )}

          <Reveal className="md:col-span-6 md:col-start-7" delay={0.15}>
            <div className="space-y-6">
              {paragraphs.length > 0 ? (
                paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? "display-serif text-3xl leading-[1.2] text-ink md:text-4xl"
                        : "text-base leading-[1.8] text-muted"
                    }
                  >
                    {p}
                  </p>
                ))
              ) : (
                <p className="text-muted">Sadržaj još nije unesen.</p>
              )}
            </div>

            {detail2 && (
              <div className="relative mt-12 aspect-[3/2] w-full overflow-hidden bg-line/40">
                <BlurImage src={detail2} alt="" fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
