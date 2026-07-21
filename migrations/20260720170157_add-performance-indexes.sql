-- Add indexes for frequently queried and sorted columns to optimize database speed

-- 1. Index for public.launches: filter by is_approved, sort by created_at DESC
CREATE INDEX IF NOT EXISTS idx_launches_approved_created_at 
ON public.launches (is_approved, created_at DESC);

-- 2. Foreign key indexes on public.launches for joins & lookups
CREATE INDEX IF NOT EXISTS idx_launches_user_id 
ON public.launches (user_id);

CREATE INDEX IF NOT EXISTS idx_launches_template_id 
ON public.launches (template_id);

-- 3. Composite index for public.launch_screenshots: lookup by launch_id, sort by order
CREATE INDEX IF NOT EXISTS idx_launch_screenshots_launch_id_order 
ON public.launch_screenshots (launch_id, "order" ASC);

-- 4. Composite index for public.comments: lookup by launch_id, sort by created_at
CREATE INDEX IF NOT EXISTS idx_comments_launch_id_created_at 
ON public.comments (launch_id, created_at ASC);
