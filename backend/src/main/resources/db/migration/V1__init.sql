-- ============================================================
--  Inicijalna sema za portfolio fotografa
-- ============================================================

-- Kategorije radova
CREATE TABLE categories (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    slug           VARCHAR(180) NOT NULL UNIQUE,
    description    TEXT,
    cover_photo_id BIGINT,
    display_order  INT NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Radovi (fotografije)
CREATE TABLE photos (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title         VARCHAR(200),
    description   TEXT,
    category_id   BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    object_key    VARCHAR(400) NOT NULL,
    thumbnail_key VARCHAR(400),
    width         INT,
    height        INT,
    featured      BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cover kategorije pokazuje na jedan rad
ALTER TABLE categories
    ADD CONSTRAINT fk_category_cover
    FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL;

CREATE INDEX idx_photos_category ON photos(category_id);
CREATE INDEX idx_photos_featured ON photos(featured);

-- About Us sadrzaj (jedan red)
CREATE TABLE about_content (
    id           BIGINT PRIMARY KEY,
    heading      VARCHAR(200),
    body         TEXT,
    portrait_key VARCHAR(400),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Podesavanja sajta (jedan red)
CREATE TABLE site_settings (
    id                  BIGINT PRIMARY KEY,
    site_name           VARCHAR(150),
    tagline             VARCHAR(300),
    email               VARCHAR(200),
    phone               VARCHAR(80),
    address             VARCHAR(300),
    location            VARCHAR(200),
    instagram_url       VARCHAR(300),
    facebook_url        VARCHAR(300),
    hero_title          VARCHAR(300),
    hero_subtitle       VARCHAR(400),
    hero_photo_id       BIGINT REFERENCES photos(id) ON DELETE SET NULL,
    press_quote         TEXT,
    press_source        VARCHAR(200),
    editorial_statement TEXT,
    seo_title           VARCHAR(200),
    seo_description     VARCHAR(400),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Poruke iz kontakt forme
CREATE TABLE contact_messages (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    email      VARCHAR(200) NOT NULL,
    message    TEXT NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed singleton redova da admin uvijek ima sta da uredjuje
INSERT INTO about_content (id, heading, body)
VALUES (1, 'O meni', 'Ovdje ide tekst o fotografu. Uredi ga u administraciji.');

INSERT INTO site_settings (id, site_name, tagline, email, hero_title, hero_subtitle, editorial_statement)
VALUES (
    1,
    'Studio',
    'Fotografija koja pripovijeda',
    'hello@example.com',
    'Vizuelne priče',
    'Fotografija koja ostaje',
    'Svaka fotografija je priča. Dozvolite da vašu ispričamo kroz editorijalni objektiv.'
);
