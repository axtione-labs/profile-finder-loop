import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, role, subject, message }: ContactRequest = await req.json();

    if (!firstName || !lastName || !email || !role || !subject || !message) {
      throw new Error("Tous les champs sont requis");
    }

    const emailResponse = await resend.emails.send({
      from: "DealFlowNetwork <onboarding@resend.dev>",
      to: ["farouk.hmdi@gmail.com"],
      subject: `[Contact] ${subject}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #14b8a6; padding-bottom: 10px;">Nouvelle demande de contact</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px 0; color: #666; width: 120px;">Prénom</td><td style="padding: 8px 0; font-weight: 600;">${firstName}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Nom</td><td style="padding: 8px 0; font-weight: 600;">${lastName}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #14b8a6;">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Rôle</td><td style="padding: 8px 0; font-weight: 600;">${role}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Sujet</td><td style="padding: 8px 0; font-weight: 600;">${subject}</td></tr>
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
            <p style="color: #666; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
            <p style="color: #333; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    });

    console.log("Contact email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
