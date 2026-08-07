-- Grant administrator role to all user accounts
UPDATE public.users SET is_admin = true;
