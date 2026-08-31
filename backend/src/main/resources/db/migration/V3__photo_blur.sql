-- LQIP: mali base64 blur (data URI) originala slike, generisan pri uploadu.
-- Koristi ga frontend kao placeholder dok se prava slika ne učita.
-- Starije fotografije ostaju NULL (frontend tad koristi neutralni fallback blur).
ALTER TABLE photos ADD COLUMN blur_data_url TEXT;
