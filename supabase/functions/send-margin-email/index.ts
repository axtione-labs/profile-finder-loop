const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, firstName, position, client, marginStatus, requestedMargin, adminMargin } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ message: "No userId provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not set — skipping margin email");
      return new Response(
        JSON.stringify({ message: "Email service not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user email using service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
    const email = userData?.user?.email;
    if (!email) {
      return new Response(JSON.stringify({ message: "User email not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const statusLabels: Record<string, { emoji: string; title: string; message: string }> = {
      accepted: {
        emoji: "✅",
        title: "Marge acceptée",
        message: `Bonne nouvelle ! Votre marge de <strong>${requestedMargin}€/jour</strong> sur la mission <strong>${position}</strong> chez <strong>${client}</strong> a été acceptée.`,
      },
      refused: {
        emoji: "❌",
        title: "Marge refusée",
        message: `Votre demande de marge de <strong>${requestedMargin}€/jour</strong> sur la mission <strong>${position}</strong> chez <strong>${client}</strong> a été refusée. Vous pouvez contacter l'équipe pour en discuter.`,
      },
      adapted: {
        emoji: "🔄",
        title: "Marge ajustée",
        message: `Votre marge sur la mission <strong>${position}</strong> chez <strong>${client}</strong> a été ajustée de <strong>${requestedMargin}€/jour</strong> à <strong>${adminMargin}€/jour</strong>. Contactez l'équipe si vous avez des questions.`,
      },
    };

    const info = statusLabels[marginStatus];
    if (!info) {
      return new Response(JSON.stringify({ message: "Invalid margin status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 12px; border-radius: 12px;">
            <span style="color: white; font-size: 24px; font-weight: bold;">⚡</span>
          </div>
          <h1 style="margin: 16px 0 0; font-size: 24px; color: #1a1a2e;">DealFlowNetwork</h1>
        </div>
        <h2 style="color: #1a1a2e; font-size: 20px;">${info.emoji} ${info.title}</h2>
        <p style="color: #555; line-height: 1.6; font-size: 16px;">Bonjour ${firstName || ""},</p>
        <p style="color: #555; line-height: 1.6; font-size: 16px;">${info.message}</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://profile-finder-loop.lovable.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Voir mes besoins →
          </a>
        </div>
        <p style="color: #888; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
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
        subject: `${info.emoji} ${info.title} — ${position} (${client})`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailRes.json();
    console.log("Margin email sent:", emailResult);

    return new Response(JSON.stringify({ success: true }), {
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
