# HANDOFF — Portfolio sajt za fotografa

> Dokument za novu sesiju / novog developera. Sadrži cijelo stanje projekta,
> arhitekturu, gdje šta stoji, kako se pokreće, šta je urađeno, šta zna da zezne
> i šta su sljedeći koraci. Piše se na dan **2026-08-30**.

---

## 1. Šta gradimo (ukratko)

Portfolio web sajt za **jednog** fotografa (jezik: srpski/crnogorski, jednojezično).
Dva dijela u istom Next.js appu + odvojen Spring Boot backend:

1. **Prezentacioni (javni) sajt** — landing sa najboljim radovima, galerija svih
   radova, kategorije, „O meni", kontakt. Mora biti **veoma moderan i interaktivan**
   (editorial/luksuzni stil). Dizajn inspiracija: **daniloandsharon.com**.
2. **Administracija** (`/admin`) — jedan admin nalog. Upload radova, uređivanje
   rasporeda, kategorije (+ potkategorije), cover slike, istaknuti (featured) radovi,
   sadržaj „O meni", podešavanja (kontakt/hero), inbox poruka. Funkcionalnost >
   estetika, ali je urađen čisto i **mobile responsive**.

**Potvrđene odluke:**
- Monorepo: `frontend/` (Next.js) + `backend/` (Spring Boot). Dva odvojena foldera.
- Jedan admin nalog, JWT auth (bez `users` tabele).
- Slike na **Cloudflare R2** (S3-kompatibilan API), serviraju se sa javnog R2 domena.
- Baza: **Supabase** (PostgreSQL), konekcija preko **Session pooler** (port 5432).
- Deploy: **backend → Render**, **frontend → Vercel**.

---

## 2. Tech stack (stvarne verzije)

**Backend** (`backend/pom.xml`):
- Java 21, Spring Boot 3.3.5, Maven.
- Spring Web, Data JPA/Hibernate, Security, Validation.
- PostgreSQL driver, **Flyway** (migracije upravljaju šemom; `ddl-auto: none`).
- JWT: `io.jsonwebtoken:jjwt` 0.12.6.
- R2: AWS SDK v2 `software.amazon.awssdk:s3`.
- Thumbnails: `net.coobird:thumbnailator`.
- `spring-dotenv` (učitava `backend/.env`), `springdoc-openapi` (Swagger).

**Frontend** (`frontend/package.json`):
- Next.js **14.2.15** (App Router), React 18.3, TypeScript 5.6.
- Tailwind CSS 3.4, `framer-motion` 11, `lenis` (smooth scroll),
  `yet-another-react-lightbox` 3, `react-hook-form` 7, `clsx`.

---

## 3. Struktura repozitorijuma

```
AplikacijaZaFotografe/
├── HANDOFF.md                  # ovaj fajl
├── .claude/launch.json         # dev server config (frontend, autoPort, cwd: frontend)
├── backend/
│   ├── pom.xml
│   ├── Dockerfile              # Render build (maven:3.9-temurin-21 → temurin-21-jre)
│   ├── .env                    # PRAVE TAJNE (git-ignored) — vidi sekciju 8
│   ├── .env.example
│   └── src/main/
│       ├── java/com/fotograf/portfolio/
│       │   ├── PortfolioApplication.java
│       │   ├── config/         # SecurityConfig, R2Config, OpenApiConfig
│       │   ├── domain/         # Category, Photo, AboutContent, SiteSettings, ContactMessage
│       │   ├── repository/     # Spring Data JPA repo-i
│       │   ├── dto/            # request/response DTO-ovi
│       │   ├── service/        # PhotoService, CategoryService, StorageService, ContentService, ContactService, DtoMapper, Slugify
│       │   ├── security/       # JwtService, JwtAuthFilter, AdminAuthService
│       │   ├── exception/      # NotFound/BadRequest + GlobalExceptionHandler
│       │   └── web/            # PublicController, AuthController, web/admin/*
│       └── resources/
│           ├── application.yml
│           └── db/migration/   # V1__init.sql, V2__category_parent.sql
└── frontend/
    ├── next.config.mjs         # images.remotePatterns (r2.dev, r2.cloudflarestorage.com, unsplash, picsum)
    ├── tailwind.config.ts      # dizajn tokeni (cream/ink paleta, fontovi, ease-editorial)
    ├── .env.local.example
    └── src/
        ├── app/
        │   ├── layout.tsx      # root layout (fontovi, Grain, Cursor, SmoothScroll)
        │   ├── (site)/         # JAVNI sajt (route group)
        │   │   ├── layout.tsx  # Header + Footer + ScrollProgress
        │   │   ├── page.tsx    # landing
        │   │   ├── galerija/page.tsx
        │   │   ├── kategorije/page.tsx + kategorije/[slug]/page.tsx
        │   │   ├── o-nama/page.tsx
        │   │   └── kontakt/page.tsx
        │   └── admin/          # ADMIN (NIJE route group — realan /admin prefiks)
        │       ├── layout.tsx  # AdminAuth wrapper + AdminShell
        │       ├── login/page.tsx
        │       ├── page.tsx    # dashboard/pregled
        │       ├── radovi/page.tsx
        │       ├── kategorije/page.tsx
        │       ├── o-nama/page.tsx
        │       ├── podesavanja/page.tsx
        │       └── poruke/page.tsx
        ├── components/
        │   ├── site/           # Header, Footer, Hero, FeaturedWorks, CategoryGrid,
        │   │                   # GalleryExplorer, PhotoGallery, CategoryShowcase,
        │   │                   # ParallaxImageQuote, MaskReveal, Reveal, Interactive,
        │   │                   # SmoothScroll, Cursor, Grain, ScrollProgress, ContactForm
        │   └── admin/          # AdminShell, AdminAuth, ui, ImagePicker,
        │                       # FeaturedPicker, CategorySelect
        └── lib/
            ├── api.ts          # javni fetch + demo fallback
            ├── adminApi.ts     # admin fetch (JWT iz localStorage)
            ├── auth.ts         # getToken/setToken/clearToken (localStorage)
            ├── demo.ts         # demo podaci (Unsplash) kad backend nedostupan/prazan
            ├── categories.ts   # buildTree, slugsOf, photosIn helperi
            └── types.ts        # TS tipovi (Photo, Category, Home, About, ...)
```

---

## 4. Backend — detalji

### Domenski model
- **Category** — `id, name, slug (unique), description?, coverPhoto (FK→Photo, nullable),
  displayOrder, parent (FK→Category, self-ref, nullable), createdAt, updatedAt`.
  - **Potkategorije**: `parent_id` self-reference. **Samo jedan nivo** (parent mora
    biti top-level; potkategorija ne može imati svoju potkategoriju — validira se u
    `CategoryService.resolveParent()`). FK `ON DELETE SET NULL`.
- **Photo** — `id, title?, description?, category (FK), objectKey (R2 original),
  thumbnailKey (R2 thumb), width, height, featured (bool), displayOrder, createdAt,
  updatedAt`.
- **AboutContent** (singleton) — `heading, body, portraitKey`.
- **SiteSettings** (singleton) — kontakt, hero landinga, socijalne mreže, editorial kopija.
- **ContactMessage** — poruke iz kontakt forme (inbox u adminu; bez slanja mejla).

### Migracije (Flyway, `db/migration/`)
- `V1__init.sql` — sve tabele.
- `V2__category_parent.sql` — `ALTER TABLE categories ADD COLUMN parent_id BIGINT`
  + FK `fk_category_parent` ON DELETE SET NULL + index.
- **Nova promjena šeme = novi `V3__...sql`.** Ne dirati postojeće migracije.

### REST API
**Javni** (`/api/public/**`, bez auth):
`GET /home`, `GET /photos` (`?categoryId=`, `?featured=true`), `GET /categories`,
`GET /categories/{slug}`, `GET /about`, `GET /contact`, `POST /contact`.

**Auth:** `POST /api/auth/login` → JWT.

**Admin** (`/api/admin/**`, JWT):
- Photos: `POST` (multipart upload → R2 + thumbnail), `GET/PUT/DELETE /{id}`,
  `PATCH .../featured`, reorder.
- Categories: `GET/POST/PUT/DELETE`, set cover, reorder.
- Content: `PUT /about` (+ portret upload), `PUT /site-settings`.
- Contact: `GET` poruke.

### R2 (StorageService)
- Upload: primi multipart → pročitaj dimenzije → generiši thumbnail → uploaduj
  original + thumb na R2 → sačuvaj ključeve + width/height.
- **VAŽNO (već popravljeno):** thumbnaili se **UVIJEK** snimaju kao **JPEG**. Za PNG sa
  alfa kanalom, alfa se „spljošti" na bijelu pozadinu (`BufferedImage TYPE_INT_RGB` +
  `Graphics2D` fill white pa drawImage) prije `Thumbnails.of(source).outputFormat("jpg")`.
  Thumb ključ = `base + "_thumb.jpg"`. (Razlog: raniji PNG thumb-ovi su bili crni/lomili se.)
- Serviranje: slike idu **direktno sa R2 javnog domena** (`public-base-url`), ne kroz Spring.
  DTO vraća pune URL-ove.

### Sigurnost / CORS
- `SecurityConfig` koristi `setAllowedOriginPatterns(...)` (NE `setAllowedOrigins`) da bi
  `*` radio zajedno sa credentials. CORS origini iz `APP_CORS_ORIGINS` (trenutno `*` za dev).
- `R2Config` je tolerantan na prazne R2 kredencijale (koristi „not-configured" placeholder
  da se app digne i bez R2 konfiguracije).

---

## 5. Frontend — detalji

### Dizajn sistem (`tailwind.config.ts` + `app/layout.tsx`)
- Paleta: **cream `#F6F3EE`** / **ink `#14110E`**, `line`, `muted` akcenti.
- Fontovi: **Playfair Display** (serif italik, display naslovi), **Oswald** (uppercase
  kondenzovani), **Inter** (tekst). Utility klase: `display-serif`, `eyebrow`.
- `ease-editorial` custom bezier; duge, spore tranzicije.
- Globalni efekti (root layout): `Grain` (film grain overlay), `Cursor` (custom „Vidi" ring),
  `SmoothScroll` (Lenis).

### Ključne javne komponente
- **Header.tsx** — minimalan; numerisana nav + full-screen overlay meni sa kontakt blokom.
- **Hero.tsx** — full-bleed hero + veliki display naslov.
- **FeaturedWorks.tsx** — **masonry kolaž** (`columns-1 sm:columns-2 xl:columns-3`), svaka
  slika u prirodnom aspektu (`break-inside-avoid`, `h-auto w-full`), hover caption, lightbox.
  Ovo je nekoliko puta redizajnirano na zahtjev korisnika — sada je finalno (kolaž, bez
  kropovanja portreta preko cijele širine).
- **CategoryGrid.tsx / CategoryShowcase.tsx** — image-forward prikaz kategorija.
- **GalleryExplorer.tsx** — dvonivovski filter (parent → subcat) za galeriju.
- **ParallaxImageQuote.tsx**, **MaskReveal.tsx** (clip-path inset reveal), **Reveal.tsx**,
  **ScrollProgress.tsx**.
- **Cursor.tsx** — prsten „Vidi" se prikazuje **samo** iznad elemenata sa `data-cursor="view"`.
  Globalni `cursor: none` je uklonjen (da se cursor vidi u lightbox-u); `cursor: none` je samo
  na `[data-cursor="view"]` elementima.
- **Interactive.tsx** — Marquee/Counter/Magnetic (Marquee i Counter trenutno NISU u upotrebi).

### Admin komponente
- **AdminShell.tsx** — **mobile responsive** (najskorije urađeno): desktop bočni meni
  (`hidden md:flex`), mobilna gornja traka sa hamburgerom + slide-in drawer (overlay,
  zatvara se na klik van / promjenu rute; `body overflow hidden` dok je otvoren).
- **AdminAuth.tsx** — štiti admin rute (redirect na `/admin/login` bez tokena).
- **ImagePicker.tsx** — modal za izbor jedne slike (cover/hero).
- **FeaturedPicker.tsx** — modal za multi-izbor istaknutih (amber ivica + ★).
- **CategorySelect.tsx** — kaskadni dropdown (parent → „— cijela [kategorija] —" + potkategorije).
- `radovi/page.tsx` — lista + multi-file drag&drop upload (ime fajla → naziv rada ako nije unesen),
  filteri (kategorija + pretraga po imenu), reorder, featured toggle. PhotoRow je responsive
  (thumbnail+sadržaj i akciona dugmad se slažu/prelamaju na mobilnom).
- `kategorije/page.tsx` — ParentGroup (parent + collapsible potkategorije), grupisani reorder
  (moveParent/moveChild), CreateForm sa parent selectom. CategoryRow responsive.
- `o-nama/page.tsx` — portret se auto-uploaduje na izbor fajla (local preview + „Otpremam…" overlay).

### API sloj (`lib/api.ts`)
- `const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"`.
- **Demo fallback**: ako fetch padne ILI backend vrati prazno, koristi `demo.ts` (Unsplash
  slike + parent/sub kategorije). Zato sajt uvijek izgleda popunjeno, ali **demo podaci =
  znak da backend nije dostupan ili je baza prazna**.
- `revalidate: 30` (ISR).

---

## 6. Kako pokrenuti lokalno

**Frontend** (preko launch.json, `autoPort: true`):
```bash
cd frontend && npm install && npm run dev
```
(U Claude Code: `preview_start` sa `{name: "frontend"}`.)

**Backend** — korisnik ga diže iz **IntelliJ** (potrebna **JDK 21**; Java/Maven NISU na PATH-u
u shell-u, pa `mvn` iz terminala ne radi). Alternativa: `./mvnw spring-boot:run` iz IntelliJ
terminala. Swagger: `http://localhost:8080/swagger-ui.html`. Backend sluša na **8080**.

> Kad backend NIJE upaljen: frontend na `localhost:8080` dobije `ECONNREFUSED` → prikazuje
> demo podatke. To je očekivano ponašanje, nije bug.

---

## 7. Deploy

- **Backend → Render** (Docker, `backend/Dockerfile`). Sve tajne se postavljaju kao
  **Environment Variables na Render-u** (ne iz `.env` fajla).
- **Frontend → Vercel.**
  - **`NEXT_PUBLIC_API_URL`** mora biti postavljen na javni URL Render backend-a (npr.
    `https://<app>.onrender.com`). Ovo je **build-time inline-ovano** i vidljivo u browseru
    → na Vercel-u koristiti tip **Config**, NE **Secret** (nije tajna; browser je mora vidjeti).
    Ako nije postavljen, defaultuje na `localhost:8080` → prod povlači demo podatke.
  - Nakon promjene env var-a → **redeploy** je obavezan (build-time varijabla).
- **Supabase**: Session pooler string, `sslmode=require`, port 5432.

### ⚠️ Provjeriti na Render-u (moguć problem)
`Dockerfile` ima `EXPOSE 10000`, a `application.yml` ima **hardkodovan `server.port: 8080`**.
Render obično injektuje `PORT` env i očekuje da app sluša na njemu. Ako backend na Render-u
„ne odgovara", najvjerovatnije je **port mismatch** — riješiti tako što se u `application.yml`
stavi `server.port: ${PORT:8080}` (ili postaviti Render da probe-uje 8080). **Nije još potvrđeno
da je ovo problem — samo provjeriti prvo ako je Render backend nedostupan.**

---

## 8. Tajne / sigurnost (VAŽNO)

- **`backend/.env` sadrži PRAVE tajne** (DB lozinka, R2 access/secret ključevi) i **NIJE**
  commit-ovan (u `.gitignore`).
- **ALI `backend/src/main/resources/application.yml` trenutno ima HARDKODOVANE PRAVE TAJNE**
  (DB password `DYIoazIP6MKdI3WE`, R2 secret key, admin password `test123`). Ovo je korisnik
  sam ostavio radi lakšeg lokalnog rada.
  - **RIZIK:** ako se ovaj repo gurne na javni GitHub, tajne cure.
  - **Preporuka (više puta rečeno korisniku):** prije push-a na GitHub prebaciti sve vrijednosti
    u `.env` / env varijable i u `application.yml` ostaviti samo `${ENV_VAR}` placeholder-e
    (kao što su zakomentarisane linije na vrhu fajla). Rotirati ključeve ako su već procurili.
- Admin kredencijali: `admin` / `test123` (dev). Za prod postaviti `ADMIN_PASSWORD_HASH` (BCrypt).
- JWT se čuva u **localStorage** na frontendu (`lib/auth.ts`).

---

## 9. Riješeni problemi (da se ne ponavljaju)

- **„JVM target 5" compile error** (IntelliJ na JDK 26) → instalirati/izabrati **JDK 21** kao
  project SDK, reimport Maven.
- **„Driver claims to not accept jdbcUrl"** (Flyway) → bio malformiran Supabase URL; ispravan
  format je session pooler `jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require`.
- **„Access key ID cannot be blank"** (S3Client bean) → `R2Config` sada tolerira prazne kredencijale.
- **Next HMR lomovi** (`Cannot find module './78.js'`, `StaggerLines is not defined`,
  `Cannot read properties of undefined (reading 'call')`) → posljedica pokretanja
  `npm run build` DOK dev server radi (pokvari `.next` keš). **NIKAD ne pokretati production
  build dok dev server radi.** Fix: ugasiti server, `rm -rf .next`, ponovo `npm run dev`.
- **Cursor nestajao u lightbox-u** → uklonjen globalni `cursor: none`; sada samo na
  `[data-cursor="view"]`.
- **Portret preko cijele širine ružan** → FeaturedWorks prebačen na masonry kolaž.
- **Vercel povlači demo podatke** → `NEXT_PUBLIC_API_URL` nije bio postavljen (default localhost).

### Gotchas za preview/verifikaciju
- Screenshot-ovi često time-out-uju ili izgledaju prazno (spore demo Unsplash slike +
  mask-reveal animacije + backend down). **Pouzdanije: DOM inspekcija preko `read_page` /
  `javascript_tool` umjesto screenshot-a.**

---

## 10. Trenutno stanje

- **Frontend:** radi i verifikovan (i mobilno, 375px).
- **Backend:** korisnik ga gradi/pokreće iz IntelliJ-a; povezan sa Supabase + R2; uploadovano
  ~12 pravih fotografija. End-to-end provjereno lokalno (R2 slike učitavaju 200, next/image
  optimizer radi, CORS radi, admin CRUD radi).
- **Deploy:** backend na Render, frontend na Vercel. U toku je podešavanje da Vercel povuče
  prave podatke (`NEXT_PUBLIC_API_URL` = Config + redeploy, + probuditi Render backend).
- **Zadnji urađen task:** admin panel mobile responsive (AdminShell hamburger drawer +
  responsive redovi u Radovi/Kategorije). `tsc` prolazi.

---

## 11. Nema otvorenih (pending) taskova

Nema eksplicitno otvorenih zadataka. Deployment fine-tuning (Vercel env + Render port) je u
rukama korisnika. Prije bilo kakvog novog rada — sačekati instrukciju korisnika.

### Ideje za dalje (nije naručeno — samo prijedlozi)
- Provjeriti/riješiti Render port mismatch (sekcija 7).
- Izmjestiti tajne iz `application.yml` prije GitHub push-a (sekcija 8).
- Kontakt forma → opciono slanje mejla (trenutno samo snima u bazu).
- Root `README.md` sa setup uputstvima (trenutno ne postoji).

---

## 12. Konvencije rada sa korisnikom

- Korisnik komunicira na **srpskom/crnogorskom**; odgovarati na istom jeziku.
- Korisnik je vlasnik/jedini admin. Prezentacioni sajt = prioritet za dizajn; admin =
  funkcionalnost prije estetike.
- Kad se dovrši task: kratko potvrditi šta je urađeno + kako je verifikovano, pa sačekati
  sljedeću instrukciju. Ne pokretati tangencijalni rad bez potvrde.
```
