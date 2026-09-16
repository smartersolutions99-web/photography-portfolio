-- Omogucava adminu da izabere konkretnu fotografiju za pozadinu iza citata (parallax quote sekcija)
ALTER TABLE site_settings
    ADD COLUMN quote_photo_id BIGINT REFERENCES photos(id) ON DELETE SET NULL;
