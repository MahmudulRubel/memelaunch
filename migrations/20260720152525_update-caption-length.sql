-- Increase caption length from 100 to 500 to support JSON encoded meme customization data
ALTER TABLE public.launches ALTER COLUMN caption TYPE VARCHAR(500);
