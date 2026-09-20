-- migrations/20260915120000_add-seo-dossier-to-launches.sql
-- Add seo_dossier JSONB column to public.launches for in-depth SEO features, FAQs, and alternate memes
ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS seo_dossier JSONB;
