-- Add product_description and product_logo_url columns to public.launches
ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS product_description TEXT;
ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS product_logo_url TEXT;
