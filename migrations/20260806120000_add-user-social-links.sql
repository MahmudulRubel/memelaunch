-- Add social and portfolio links to public.users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github_handle TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS website_url TEXT;
