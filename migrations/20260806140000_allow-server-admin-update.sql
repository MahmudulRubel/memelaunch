-- Allow server API key (where auth.uid() IS NULL) to manage launch approval and user admin status
CREATE OR REPLACE FUNCTION public.check_launch_moderation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_approved = true THEN
      IF auth.uid() IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND is_admin = true
      ) THEN
        NEW.is_approved := false;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_approved IS DISTINCT FROM NEW.is_approved THEN
      IF auth.uid() IS NOT NULL AND NOT EXISTS (
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

CREATE OR REPLACE FUNCTION public.check_user_admin_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    IF auth.uid() IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_admin = true
    ) THEN
      RAISE EXCEPTION 'Only administrators can change the admin status of a user.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
