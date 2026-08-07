-- Migration: Add views_count and clicks_count columns to public.launches
ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0 NOT NULL;
ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS clicks_count INT DEFAULT 0 NOT NULL;

-- Helper RPC function to atomically increment product views
CREATE OR REPLACE FUNCTION increment_launch_views(launch_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.launches
  SET views_count = views_count + 1
  WHERE id = launch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper RPC function to atomically increment outbound link clicks
CREATE OR REPLACE FUNCTION increment_launch_clicks(launch_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.launches
  SET clicks_count = clicks_count + 1
  WHERE id = launch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
