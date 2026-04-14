import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL_MAP: Record<string, string> = {
  "heofonix-1.0": "google/gemini-2.5-flash-lite",
  "heofonix-2.0": "google/gemini-2.5-flash",
  "heofonix-nova": "google/gemini-2.5-flash",
  "heofonix-alpha": "google/gemini-2.5-flash-lite",
  "heofonix-gammaray-6.0": "google/gemini-2.5-pro",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  "heofonix-1.0":
    "You are Heofonix 1.0, a helpful and friendly AI assistant by Heofonix AI. You are knowledgeable, concise, and helpful. You can answer questions on any topic. Always be accurate and informative. Format responses with markdown when helpful.",
  "heofonix-2.0":
    "You are Heofonix 2.0, an advanced AI assistant by Heofonix AI with web search capabilities. You are extremely knowledgeable and can provide up-to-date information. When users ask about current events or need real-time info, provide the best answer you can. You're smart, detailed, and thorough. Format responses with markdown when helpful.",
  "heofonix-nova":
    "You are Heofonix Nova, a creative and intelligent AI assistant by Heofonix AI. You excel at creative tasks, brainstorming, writing, and complex problem-solving. You think deeply and provide insightful, well-structured responses. Format responses with markdown when helpful.",
  "heofonix-alpha":
    "You are Heofonix Alpha, the fastest AI model by Heofonix AI. You are optimized for speed while maintaining high quality responses. Be concise yet thorough. Format responses with markdown when helpful.",
  "heofonix-gammaray-6.0":
    "You are Heofonix GammaRay 6.0, the most powerful AI model by Heofonix AI. You have the deepest reasoning capabilities and can handle the most complex questions. You excel at analysis, coding, mathematics, science, and multi-step reasoning. Provide comprehensive, well-structured answers. Format responses with markdown when helpful.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model = "heofonix-2.0" } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const actualModel = MODEL_MAP[model] || "google/gemini-2.5-flash";
    const systemPrompt = SYSTEM_PROMPTS[model] || SYSTEM_PROMPTS["heofonix-2.0"];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
