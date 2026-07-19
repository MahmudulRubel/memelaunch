-- 1. Add is_admin column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Add is_approved column to launches table
ALTER TABLE public.launches ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- 3. Set existing users and launches
UPDATE public.users SET is_admin = true WHERE id = '5f844f38-e651-4b83-a6b7-924afd4d95b7';
UPDATE public.launches SET is_approved = true;

-- 4. Enable admin RLS policies for public.launches
CREATE POLICY admin_update_launches ON public.launches FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY admin_delete_launches ON public.launches FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));
