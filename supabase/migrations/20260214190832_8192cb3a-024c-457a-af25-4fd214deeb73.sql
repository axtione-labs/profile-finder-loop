
-- Create a function that calls the welcome email edge function
CREATE OR REPLACE FUNCTION public.notify_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'record', jsonb_build_object(
      'user_id', NEW.user_id,
      'first_name', NEW.first_name,
      'last_name', NEW.last_name
    )
  );
  
  PERFORM net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1) || '/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
    ),
    body := payload
  );
  
  RETURN NEW;
END;
$$;

-- Trigger on profile creation
CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_welcome_email();
