# Portfolio sajt za fotografa

Full-stack aplikacija u dva dijela:

1. **Prezentacioni sajt** (`frontend/`) — javni portfolio sa modernim, interaktivnim editorial dizajnom (landing, galerija, kategorije, o meni, kontakt).
2. **Administracija** (`frontend/` → `/admin`) — panel za fotografa: upload radova, kategorije, cover slike, featured radovi, sadržaj stranica, kontakt info, poruke.

Backend (`backend/`) je Spring Boot REST API. Slike se čuvaju na **Cloudflare R2**, baza je **Supabase (PostgreSQL)**.

```
AplikacijaZaFotografe/
├── backend/     # Spring Boot (Java 21, Maven)
└── frontend/    # Next.js 14 (App Router, TypeScript, Tailwind)
```

---

## Preduslovi

- **Node.js 18+** (za frontend) — provjereno sa Node 22.
- **JDK 21** (za backend). Preporuka: Temurin/OpenJDK 21 (LTS). U IntelliJ-u: *Project Structure → SDK → Download JDK → Temurin 21*.
- **Supabase** nalog (besplatan) — PostgreSQL baza.
- **Cloudflare R2** nalog — skladište slika (S3-kompatibilno).

---

## 1) Supabase (baza)

1. Napravi projekat na [supabase.com](https://supabase.com).
2. *Project Settings → Database → Connection string → **Session pooler*** → izaberi **JDBC**.
3. Iskopiraj host, port (5432), korisnika (`postgres.<ref>`) i lozinku.

> Koristi **Session pooler** (ne Transaction pooler) — kompatibilan je sa JPA/HikariCP.

Tabele se prave automatski pri prvom pokretanju backenda (Flyway migracija).

## 2) Cloudflare R2 (slike)

1. U Cloudflare dashboard-u: **R2 → Create bucket** (npr. `fotograf-portfolio`).
2. **Manage R2 API Tokens → Create API token** (Object Read & Write) → sačuvaj *Access Key ID* i *Secret Access Key* i *Account ID*.
3. Uključi javni pristup: bucket → **Settings → Public access** → omogući `r2.dev` URL (ili poveži custom domen). Taj URL ide u `R2_PUBLIC_BASE_URL`.

---

## Backend — pokretanje

1. Kopiraj `backend/.env.example` u `backend/.env` i popuni vrijednosti (Supabase + R2 + admin lozinka + JWT tajna).
2. Pokreni:
   - **IntelliJ IDEA** (preporučeno): *Open* → izaberi `backend/` folder → sačekaj Maven import → pokreni `PortfolioApplication`. (`.env` se automatski učitava.)
   - **Komandna linija** (ako imaš Maven): 

     ```bash
     cd backend
     mvn spring-boot:run
     ```

Backend radi na `http://localhost:8080`.
- Swagger/OpenAPI za testiranje: `http://localhost:8080/swagger-ui.html`
- Login: `POST /api/auth/login` → vrati JWT → u Swagger-u klikni **Authorize** i zalijepi token.

### Admin kredencijali
Postavljaju se u `backend/.env`:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tvoja-lozinka
```
App heshira lozinku na startu (BCrypt). Za produkciju možeš umjesto toga postaviti `ADMIN_PASSWORD_HASH`.

---

## Frontend — pokretanje

1. Kopiraj `frontend/.env.local.example` u `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```
2. Instaliraj i pokreni:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
Frontend radi na `http://localhost:3000`.

- Javni sajt: `http://localhost:3000`
- Administracija: `http://localhost:3000/admin` (login na `/admin/login`)

> **Demo režim:** ako backend nije pokrenut, javni sajt prikazuje ugrađene demo podatke (placeholder slike) da bi se dizajn mogao vidjeti odmah. Čim backend proradi, prikazuju se pravi podaci.

---

## API pregled

**Javno** (`/api/public`): `home`, `photos` (`?categoryId=`, `?featured=true`), `categories`, `categories/{slug}`, `about`, `contact` (GET/POST).

**Admin** (`/api/admin`, traži JWT): `photos` (CRUD, upload, `/{id}/featured`, `/order`), `categories` (CRUD, `/{id}/cover`, `/order`), `about` (+`/about/portrait`), `site-settings`, `contact-messages`.

**Auth**: `POST /api/auth/login`.

---

## Model podataka (ukratko)

- **Photo** — naziv (opciono), opis (opciono), kategorija, R2 ključevi (original + thumbnail), dimenzije, `featured`, redoslijed.
- **Category** — naziv, slug, opis, cover slika (FK na Photo), redoslijed.
- **SiteSettings** (singleton) — naziv sajta, kontakt, hero početne, editorial tekstovi, SEO.
- **AboutContent** (singleton) — naslov, tekst, portret.
- **ContactMessage** — poruke sa kontakt forme.

---

## Napomene za produkciju

- Frontend: `npm run build && npm run start` (ili deploy na Vercel). Dodaj R2 javni domen u `frontend/next.config.mjs` → `images.remotePatterns` ako koristiš custom domen.
- Backend: `mvn clean package` → `java -jar target/portfolio-backend-0.0.1-SNAPSHOT.jar` sa postavljenim env varijablama.
- Postavi `APP_CORS_ORIGINS` na produkcioni URL frontenda.
- Sve tajne drži u `.env` fajlovima (nisu u git-u).
