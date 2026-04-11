const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();

    const email = record?.email;
    const firstName = record?.first_name || "Apporteur";

    if (!email) {
      return new Response(JSON.stringify({ message: "No email provided" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not set — skipping welcome email for", email);
      return new Response(
        JSON.stringify({ message: "Email service not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const platformUrl = "https://profile-finder-loop.lovable.app";

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 12px; border-radius: 12px;">
            <span style="color: white; font-size: 24px; font-weight: bold;">⚡</span>
          </div>
          <h1 style="margin: 16px 0 0; font-size: 24px; color: #1a1a2e;">Lynx</h1>
        </div>
        <h2 style="color: #1a1a2e; font-size: 20px;">Bienvenue ${firstName} ! 🎉</h2>
        <p style="color: #555; line-height: 1.6; font-size: 16px;">
          Votre compte apporteur d'affaires a bien été créé sur <strong>Lynx</strong>.
        </p>
        <p style="color: #555; line-height: 1.6; font-size: 16px;">
          Vous pouvez dès maintenant :
        </p>
        <ul style="color: #555; line-height: 2; font-size: 16px;">
          <li>📋 Déclarer vos besoins IT en quelques clics</li>
          <li>📊 Suivre l'avancement de vos leads en temps réel</li>
          <li>💰 Consulter vos commissions</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${platformUrl}/login" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Accéder à la plateforme →
          </a>
        </div>
        <p style="color: #888; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          L'équipe Lynx
        </p>
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Lynx <onboarding@resend.dev>",
        to: [email],
        subject: `Bienvenue sur DealFlow, ${firstName} !`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailRes.json();
    console.log("Welcome email sent:", emailResult);

    return new Response(JSON.stringify({ success: true, email }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
