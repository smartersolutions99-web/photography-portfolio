-- Omogucava adminu da izabere konkretnu fotografiju za "Prije/Poslije" poredjenje na pocetnoj
ALTER TABLE site_settings
    ADD COLUMN before_after_photo_id BIGINT REFERENCES photos(id) ON DELETE SET NULL;
