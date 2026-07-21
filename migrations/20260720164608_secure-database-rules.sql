-- 1. Restructure public.launches select policy (defense-in-depth against IDOR on unapproved products)
DROP POLICY IF EXISTS select_launches ON public.launches;
CREATE POLICY select_launches ON public.launches FOR SELECT USING (
  is_approved = true OR 
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true))
);

-- 2. Restructure public.launch_screenshots select policy (prevent direct access to unapproved product media)
DROP POLICY IF EXISTS select_screenshots ON public.launch_screenshots;
CREATE POLICY select_screenshots ON public.launch_screenshots FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.launches
    WHERE launches.id = launch_screenshots.launch_id
    AND (
      launches.is_approved = true OR 
      launches.user_id = auth.uid() OR
      (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true))
    )
  )
);

-- 3. Restructure public.comments select policy (prevent direct access to unapproved product discussion)
DROP POLICY IF EXISTS select_comments ON public.comments;
CREATE POLICY select_comments ON public.comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.launches
    WHERE launches.id = comments.launch_id
    AND (
      launches.is_approved = true OR
      launches.user_id = auth.uid() OR
      (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true))
    )
  )
);

-- 4. Restructure public.reactions select policy (prevent direct access to unapproved product metrics)
DROP POLICY IF EXISTS select_reactions ON public.reactions;
CREATE POLICY select_reactions ON public.reactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.launches
    WHERE launches.id = reactions.launch_id
    AND (
      launches.is_approved = true OR
      launches.user_id = auth.uid() OR
      (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true))
    )
  )
);

-- 5. Trigger to restrict updating/inserting is_approved column to admins only (prevents moderation bypass)
CREATE OR REPLACE FUNCTION public.check_launch_moderation()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT, force is_approved to false unless user is an admin
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_approved = true THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND is_admin = true
      ) THEN
        NEW.is_approved := false;
      END IF;
    END IF;
  -- On UPDATE, prevent non-admins from altering is_approved
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_approved IS DISTINCT FROM NEW.is_approved THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND is_admin = true
      ) THEN
        RAISE EXCEPTION 'Only administrators can change the approval status of a launch.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_launch_moderation ON public.launches;
CREATE TRIGGER on_launch_moderation
  BEFORE INSERT OR UPDATE ON public.launches
  FOR EACH ROW
  EXECUTE FUNCTION public.check_launch_moderation();

-- 6. Trigger to restrict updating is_admin column in public.users to admins only (prevents privilege escalation)
CREATE OR REPLACE FUNCTION public.check_user_admin_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    ) THEN
      RAISE EXCEPTION 'Only administrators can change the admin status of a user.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_admin_update ON public.users;
CREATE TRIGGER on_user_admin_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_user_admin_update();
