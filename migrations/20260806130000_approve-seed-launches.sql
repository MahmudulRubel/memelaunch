-- Update trigger to allow server-side API key operations (auth.uid() IS NULL) to manage approval
CREATE OR REPLACE FUNCTION public.check_launch_moderation()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT, force is_approved to false unless user is an admin or service key (auth.uid() IS NULL)
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_approved = true THEN
      IF auth.uid() IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND is_admin = true
      ) THEN
        NEW.is_approved := false;
      END IF;
    END IF;
  -- On UPDATE, prevent non-admins from altering is_approved
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

-- Approve all launches in public.launches
UPDATE public.launches SET is_approved = true;
