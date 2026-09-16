-- "Naše zajedničke priče" sekcija na početnoj strani

CREATE TABLE stories (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    body          TEXT NOT NULL,
    photo_id      BIGINT REFERENCES photos(id) ON DELETE SET NULL,
    accent_color  VARCHAR(20) NOT NULL DEFAULT '#9A7B4F',
    display_order INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stories_order ON stories(display_order);

-- Seed sa postojecim tekstovima da admin ne pocinje od praznog (slika se bira naknadno kroz admin)
INSERT INTO stories (title, body, accent_color, display_order) VALUES
('Venčanje u vinogradu', 'Zalazak sunca, miris grožđa i dvoje ljudi koji su rekli da. Pratili smo svjetlo cijelo poslijepodne dok se selilo kroz redove čokota.', '#9A7B4F', 0),
('Porodica na moru', 'Bosi na pijesku, djeca koja trče ka valovima — najiskrenije fotografije su uvijek one koje niko nije pozirao.', '#A9633F', 1),
('Rođendan u prirodi', 'Drveni sto ispod borova i smijeh koji se čuje sa svih strana. Proslava kakvu pamtiš godinama unazad.', '#6E7A5E', 2);
