
DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON public.profiles;
DROP FUNCTION IF EXISTS public.notify_welcome_email();
