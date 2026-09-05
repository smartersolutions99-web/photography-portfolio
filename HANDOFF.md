# HANDOFF — Portfolio sajt za fotografa

> Živi dokument za novu sesiju / novog developera. Trenutno stanje projekta,
> arhitektura, nove komponente, kako se pokreće, šta je urađeno i šta zna da zezne.
> Ažurirano: **2026-09-01**.

---

## 1. Šta gradimo

Portfolio web sajt za **jednog** fotografa (jezik: srpski/crnogorski, jednojezično).
Veoma moderan, editorial/luksuzni stil (referenca: high-end „Showit" template-i za fotografe).
Dva dijela u istom Next.js appu + odvojen Spring Boot backend:

1. **Javni sajt** — hero, izabrani radovi, portfolio (kategorije), „O meni", kontakt.
2. **Admin** (`/admin`) — jedan nalog, upload radova, kategorije, cover/featured, „O meni",
   podešavanja, inbox poruka. Funkcionalnost > estetika, mobile responsive.

**Potvrđene odluke:** monorepo `frontend/` (Next.js) + `backend/` (Spring Boot); jedan admin
nalog + JWT (bez `users` tabele); slike na **Cloudflare R2** (serviraju se sa javnog R2 domena);
baza **Supabase** (Session pooler, port 5432); deploy **backend → Render**, **frontend → Vercel**.

---

## 2. Tech stack

**Frontend** (`frontend/package.json`): Next.js **14.2.15** (App Router), React 18.3, TS 5.6,
Tailwind 3.4, `framer-motion` 11, `lenis` (smooth scroll), `yet-another-react-lightbox` 3, `clsx`.
Fontovi (next/font/google): **Space Grotesk** (naslovi/brend, var `--font-serif`) + **Inter**
(tekst, `--font-sans`). Bez kurziva/italic display fonta (odluka vlasnika).

**Backend** (`backend/pom.xml`): Java 21, Spring Boot 3.3.5, Maven. Web, JPA/Hibernate, Security,
Validation, PostgreSQL, **Flyway** (`ddl-auto: none`), JWT (jjwt 0.12.6), AWS SDK v2 S3 (R2),
Thumbnailator, spring-dotenv, springdoc (Swagger).

> **Java/Maven NISU na PATH-u** u shell-u — backend se diže iz **IntelliJ-a** (JDK 21).

---

## 3. Struktura (frontend/src)

```
app/
  layout.tsx           # root: fontovi (Space Grotesk + Inter), globalni SEO metadata (metadataBase, OG, robots)
  robots.ts            # /robots.txt (disallow /admin, sitemap)
  sitemap.ts           # /sitemap.xml (statične rute + kategorije, dinamički)
  globals.css          # tokeni, .display-serif (grotesk, uspravno), .eyebrow, iris-open keyframes, masonry, lenis
  (site)/
    layout.tsx         # SmoothScroll + CameraIntro + ScrollProgress + Grain + Cursor + FloatingContact + Header + Footer + JsonLd
    page.tsx           # POČETNA (nova struktura, vidi §5)
    galerija/, kategorije/[slug]/, o-nama/, kontakt/  # ostale stranice
  admin/               # admin (nepromijenjen ove sesije)
components/site/
  PortfolioHero.tsx    # NOVI hero (slika + ime + citat + CTA), zamijenio ContactMasthead
  FeaturedRow.tsx      # 3 fotografije u redu (zamijenio veliki kolaž FeaturedWorks)
  SectionHeader.tsx    # editorial zaglavlje sekcije (hairline + broj 01/02/03 + naslov + link)
  CameraIntro.tsx      # intro: crno → „skidanje poklopca" (iris) → fokus → blic → reveal
  InlineContactForm.tsx# „pismo" forma (label + podvučena praznina) + dropdown + date picker
  CameraDatePicker.tsx # custom „kamera" date picker (viewfinder, iris, HUD, blic na odabir)
  Typewriter.tsx       # kucanje teksta (koristi se za naslov u ContactMasthead-u — sad NEAKTIVNO)
  BlurImage.tsx        # omotač oko next/image sa blur placeholderom (pravi LQIP ili fallback)
  JsonLd.tsx           # structured data <script type=ld+json>
  FloatingContact.tsx  # suptilan „Kontaktirajte nas" pill (dole desno, nakon skrola)
  Header.tsx           # adaptivni transparentni header (vidi §6)
  Footer.tsx           # tamni footer + kontakt info + jednostavna ContactForm
  ContactForm.tsx      # jednostavna forma (light/dark, compact) — koristi se u footeru
  Grain.tsx, Cursor.tsx, ScrollProgress.tsx, SmoothScroll.tsx, MaskReveal.tsx, Reveal.tsx,
  Hero.tsx, ContactMasthead.tsx, PortfolioMasthead.tsx, FeaturedWorks.tsx, ParallaxImageQuote.tsx,
  CategoryGrid.tsx, CategoryShowcase.tsx, GalleryExplorer.tsx, PhotoGallery.tsx, Interactive.tsx
lib/
  api.ts        # javni fetch + demo fallback + 12s timeout (Render cold-start)
  intro.ts      # koordinacija intro↔sadržaj (revealIntro / useIntroReveal)
  scroll.ts     # smoothScrollTo (koristi window.__lenis), izloženo iz SmoothScroll
  media.ts      # FALLBACK_BLUR (svg data-uri) + photoAlt()
  seo.ts        # SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, pageMetadata()
  categories.ts, types.ts, demo.ts, adminApi.ts, auth.ts
```

> **Neaktivne (ali još u repou) komponente:** `ContactMasthead`, `PortfolioMasthead`, `Hero`,
> `FeaturedWorks`, `ParallaxImageQuote`, `Typewriter`, `Interactive.Marquee/Counter`. Ostavljene
> jer se lako mogu vratiti; slobodno obrisati pri čišćenju.

---

## 4. Backend — sažetak

Domenski model: **Category** (self-ref `parent_id`, jedan nivo potkategorija), **Photo**,
**AboutContent** (singleton), **SiteSettings** (singleton), **ContactMessage**.

**R2 upload** (`StorageService`): original + JPEG thumbnail (providne slike spljošti na bijelu)
+ **`blurDataUrl`** (mali ~24px base64 JPEG za LQIP). Slike se serviraju direktno sa R2 domena.

**Migracije** (`db/migration/`): `V1__init.sql`, `V2__category_parent.sql`,
**`V3__photo_blur.sql`** (dodaje `blur_data_url TEXT` na `photos`). Nova šema = novi `V4__...`.

**API:** javni `/api/public/**` (`/home`, `/photos`, `/categories`, `/categories/{slug}`, `/about`,
`/contact` GET+POST), auth `POST /api/auth/login`, admin `/api/admin/**` (JWT).

> **PhotoDto sad ima `blurDataUrl`.** Postojeće slike (uploadovane prije V3) imaju null → frontend
> koristi elegantni fallback blur; novi uploadi dobijaju pravi LQIP.

---

## 5. POČETNA (nova struktura ove sesije)

Redoslijed: **Hero → Izabrani radovi (3 slike) → O meni (kratko) → Portfolio → CTA → Footer.**

1. **`PortfolioHero`** — full-screen fotografija + metapodaci + veliko ime studija (naslov, slova
   se dižu iz maske) + citat + „Kontaktirajte nas" dugme + scroll cue. `data-header-theme="dark"`.
   Ulazne animacije čekaju intro reveal (`useIntroReveal`). *(Ovo je bio raniji „drugi ekran";
   stari kontakt-form hero i sticky crossfade su UKLONJENI.)*
2. **Izabrani radovi** (`SectionHeader 01` + `FeaturedRow`) — **3 fotografije u redu**, klik → lightbox.
3. **O meni** (`SectionHeader 02`) — portret + par rečenica + „Saznaj više" → `/o-nama`.
4. **Portfolio** (`SectionHeader 03` + `CategoryGrid`) — kategorije kao slikovne pločice.
5. **CTA** (tamna, `data-header-theme="dark"`) — veliki „Kontaktirajte nas" → `/kontakt`.

Kontakt forma više NIJE u hero-u; živi na **`/kontakt`** (prostrano) i u **footeru** (jednostavna).

---

## 6. Ključni sistemi

### Intro animacija (`CameraIntro`, u `(site)/layout.tsx`)
Crni ekran (poklopac na objektivu) → **iris otvaranje** (CSS `iris-open`, kreće na prvom paint-u
pa NEMA zamrznutog kadra) → fotografija „lovi fokus" (mutno→oštro) → **fokus zaključan** → **blic**
→ otkriva se stranica; `revealIntro()` pušta `useIntroReveal` pa sadržaj tek tad ulazi (naslov se
mask-reveal-uje). Overlay se renderuje i na serveru (nema bljeska sadržaja prije animacije).
Vođen `setTimeout`-om (ne rAF) pa se **uvijek pouzdano ukloni**; forsira scroll na vrh na kraju.
**Igra pri SVAKOM učitavanju** (nema više „jednom po sesiji"). `prefers-reduced-motion` → preskače.
Slika = ista kao hero (`home.heroUrl ?? featured[0]`).

### Adaptivni header (`Header`)
Uvijek **transparentan**, sa **jasno vidljivom donjom linijom** (adaptivna boja). Boja teksta prati
sekciju ispod: sekcije sa `data-header-theme="dark"` → svijetli (cream) tekst; sve ostalo → tamni
(ink). Detekcija: na scroll/resize/route-change gleda koja `[data-header-theme="dark"]` sekcija
prelazi liniju na ~34px. Default `dark=true` (hero je taman). **Za nove tamne sekcije dodati
`data-header-theme="dark"`** (trenutno: hero, CTA, `kategorije/[slug]` hero).

### Forme
- **`InlineContactForm`** (na `/kontakt` i, po potrebi, gdje god treba glavna forma): „pismo" stil —
  mala uppercase labela iznad **podvučene praznine pune širine**, centrirano. Polja: ime,
  **usluga (custom dropdown)**, **datum (`CameraDatePicker`)**, lokacija, email. Šalje
  `{name, email, message}` (usluga/lokacija/datum sažima u `message`).
- **`CameraDatePicker`** — klik otvara **tamni viewfinder** (iris, ugaone zagrade, HUD `f/1.4 · 1/200s`),
  navigacija mjeseci, izabrani datum kao **retro date-stamp** (accent), **blic na odabir** dana.
  Popover se **računa i clamp-uje u viewport** (ne ispada iz ekrana).
- **`ContactForm`** — jednostavna (footer), `tone` light/dark + `compact`.

### SEO paket
`app/sitemap.ts`, `app/robots.ts`, `lib/seo.ts` (`pageMetadata()` helper). Root `layout.tsx` ima
`metadataBase` + title template + OG/Twitter default + robots. Po stranici: canonical + OG (početna
i `kategorije/[slug]` imaju dinamičku OG sliku). **JSON-LD** (`WebSite` + `LocalBusiness`) u
`(site)/layout.tsx`. Bolji `alt` tekstovi (`photoAlt`). Admin je `noindex`.
> **Postaviti `NEXT_PUBLIC_SITE_URL` na Vercel-u** (Config, ne Secret) + redeploy — inače canonical/OG/
> sitemap pokazuju `localhost:3000`.

### Blur / LQIP (`BlurImage` + `lib/media.ts`)
Sve slike prolaze kroz `BlurImage` (next/image + `placeholder="blur"`). Ako foto ima `blurDataUrl`
sa backenda → pravi LQIP; inače neutralni SVG fallback (`FALLBACK_BLUR`). Galerija nikad nije prazna
dok se slike učitavaju.

### Smoothness skrola
- **Grain** = jeftin **statični tiled-noise** (bez živog SVG filtera i bez mix-blend-a — to je bio
  glavni uzrok jank-a), opacity ~0.12.
- **Lenis** na `lerp: 0.1` režimu; masthead/hero slika `will-change: transform`.

---

## 7. Kako pokrenuti

**Frontend:** `cd frontend && npm install && npm run dev` (u Claude Code: `preview_start {name:"frontend"}`).
Autoport (traži 3000, pa slobodan port). `.env.local` trenutno gađa **Render backend** (prave slike
bez IntelliJ-a) — vidi `.env.local.example`.

**Backend:** iz IntelliJ-a (JDK 21). Swagger: `http://localhost:8080/swagger-ui.html`.

---

## 8. Deploy / env

- **Backend → Render** (Docker). Prave tajne kao Env Vars na Render-u. Live API:
  **`https://photography-portfolio-5pp5.onrender.com`**.
  ⚠️ **Render free tier „spava"** — prvi zahtjev nakon neaktivnosti je cold start (~60–90s, izmjereno i 153s).
  Frontend fetch ima **12s timeout** pa ne visi 150s (padne na demo dok se backend budi).
  Za produkciju razmisliti o **keep-warm cron ping-u**.
- **Frontend → Vercel.** `NEXT_PUBLIC_API_URL` = Render URL (Config), `NEXT_PUBLIC_SITE_URL` = domen.
  Oba su build-time inline-ovana → **redeploy nakon promjene**.
- **Supabase:** Session pooler, `sslmode=require`, port 5432.

---

## 9. Poznata ograničenja / gotchas

- **Screenshot/verifikacija u skrivenom Browser pane-u:** browser pauzira `requestAnimationFrame`
  dok je pane skriven → **framer animacije i scroll-vođene vrijednosti stoje** na screenshot-ovima
  (izgledaju „zamrznuto"). Nije bug u kodu — vidi se normalno kod korisnika. Za verifikaciju: DOM
  inspekcija (`read_page`/`javascript_tool`) ili privremeni „force-reveal" inline stilova. Skrol se
  često ne pomjera programski (Lenis) → gasiti `window.__lenis` za test.
- **Tajne u `backend/src/main/resources/application.yml`** (DB lozinka, R2 secret, admin `test123`)
  su HARDKODOVANE (vlasnik ostavio radi lokalnog rada). **Prije javnog GitHub push-a prebaciti u
  env varijable i rotirati ključeve.**
- **NIKAD ne pokretati `npm run build` dok dev server radi** (kvari `.next` keš → HMR lomovi).
- **CameraIntro igra na SVAKOM učitavanju svake stranice** (i /galerija itd.) — po zahtjevu; lako
  se vrati „jednom po sesiji" (bila je `sessionStorage` zastavica).

---

## 10. Urađeno u ovoj sesiji (changelog)

1. **Blur/LQIP** placeholderi (frontend `BlurImage` + backend `blur_data_url` V3) + bolji alt tekstovi.
2. **SEO paket** (sitemap, robots, metadata/OG/Twitter, JSON-LD, canonical).
3. **Fontovi:** Playfair/Oswald → **Space Grotesk + Inter** (bez kurziva).
4. **CameraIntro** — kamera intro (crno → iris → fokus → blic → reveal), igra svaki put.
5. **Kontakt-first hero** → kroz iteracije → **uklonjen**; početna sad otvara **PortfolioHero**.
6. **Adaptivni transparentni header** (boja teksta prema sekciji + vidljiva linija).
7. **Izabrani radovi:** veliki kolaž → **3 fotografije u redu** (`FeaturedRow`).
8. **Forme:** „pismo" `InlineContactForm` + **custom `CameraDatePicker`** + dropdown usluge;
   viewport-svjestan popover (ne ispada).
9. **Sekcijski ritam:** `SectionHeader` (hairline + broj + naslov).
10. **„Razgovarajmo" → „Kontaktirajte nas"** svuda.
11. **Smoothness:** Grain optimizovan, Lenis lerp, will-change.
12. **Render cold-start:** 12s fetch timeout; zabilježen live API URL.

---

## 11. Ideje / pending (nije naručeno)

- Očistiti neaktivne komponente (§3).
- Keep-warm cron za Render (cold start).
- Izmjestiti tajne iz `application.yml` prije GitHub push-a.
- Kontakt forma → opciono slanje mejla (trenutno samo snima u bazu).
- Backfill `blurDataUrl` za postojećih ~12 slika (ili re-upload).

## 12. Konvencije rada sa korisnikom

Komunikacija na **srpskom/crnogorskom**. Vlasnik = jedini admin, **jak profinjen editorial ukus**,
ne voli „gimmick" efekte (marquee = „odvratno", ne praviti), ne voli kurziv. Prezentacioni sajt =
prioritet za dizajn. Kad se dovrši task: kratko potvrditi šta je urađeno + kako je verifikovano,
pa sačekati sljedeću instrukciju.
