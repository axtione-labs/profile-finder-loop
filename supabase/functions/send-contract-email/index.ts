import { corsHeaders } from '@supabase/supabase-js/cors'

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, firstName, contractUrl } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not set — skipping contract email");
      return new Response(
        JSON.stringify({ message: "Email service not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const platformUrl = "https://profile-finder-loop.lovable.app";
    const name = firstName || "Apporteur";

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 12px; border-radius: 12px;">
            <span style="color: white; font-size: 24px; font-weight: bold;">📝</span>
          </div>
          <h1 style="margin: 16px 0 0; font-size: 24px; color: #1a1a2e;">DealFlowNetwork</h1>
        </div>

        <h2 style="color: #1a1a2e; font-size: 20px;">Contrat signé avec succès ✅</h2>

        <p style="color: #555; line-height: 1.6; font-size: 16px;">
          Bonjour ${name},
        </p>

        <p style="color: #555; line-height: 1.6; font-size: 16px;">
          Votre contrat d'apport d'affaires a été signé électroniquement avec succès. 
          Vous trouverez ci-dessous le lien pour télécharger votre exemplaire.
        </p>

        <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #6366f1;">
          <p style="color: #333; font-size: 14px; margin: 0 0 8px;"><strong>📋 Récapitulatif :</strong></p>
          <ul style="color: #555; line-height: 2; font-size: 14px; margin: 0; padding-left: 20px;">
            <li>Type : Contrat d'Apport d'Affaires</li>
            <li>Signature : Électronique</li>
            <li>Date : ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</li>
          </ul>
        </div>

        ${contractUrl ? `
        <div style="text-align: center; margin: 32px 0;">
          <a href="${contractUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            📥 Télécharger mon contrat
          </a>
        </div>
        ` : ''}

        <p style="color: #555; line-height: 1.6; font-size: 16px;">
          Vous pouvez également retrouver votre contrat à tout moment depuis votre 
          <a href="${platformUrl}/dashboard" style="color: #6366f1; text-decoration: underline;">tableau de bord</a>.
        </p>

        <p style="color: #555; line-height: 1.6; font-size: 14px; margin-top: 32px;">
          Une copie de ce contrat est conservée dans nos archives.
        </p>

        <p style="color: #888; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; margin-top: 32px;">
          L'équipe DealFlowNetwork
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
        from: "DealFlowNetwork <onboarding@resend.dev>",
        to: [email],
        subject: `Votre contrat d'apport d'affaires signé — DealFlowNetwork`,
        html: emailHtml,
      }),
    });

    const result = await emailRes.json();
    console.log("Contract email sent:", result);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending contract email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
