import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AssistRequest {
  action: string;
  text: string;
  customPrompt?: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  improve:
    "You are a writing assistant. Improve the following text to make it clearer, more engaging, and better structured. Maintain the original meaning and tone.",
  expand:
    "You are a writing assistant. Expand on the following text by adding more detail, examples, and explanations while maintaining the original voice and intent.",
  summarize:
    "You are a writing assistant. Create a concise summary of the following text, capturing the key points and main ideas.",
  simplify:
    "You are a writing assistant. Rewrite the following text using simpler language and shorter sentences while preserving the meaning.",
  "fix-grammar":
    "You are a writing assistant. Fix any spelling, grammar, and punctuation errors in the following text. Only make necessary corrections.",
  continue:
    "You are a writing assistant. Continue writing from where the following text left off, matching the style and tone.",
  custom:
    "You are a helpful writing assistant. Follow the user's instructions to modify or work with the provided text.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user is authenticated
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, text, customPrompt }: AssistRequest = await req.json();

    if (!action || !text) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: action, text" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[action] || SYSTEM_PROMPTS.custom;
    const userPrompt =
      action === "custom" && customPrompt
        ? `Instructions: ${customPrompt}\n\nText:\n${text}`
        : text;

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic API error:", error);
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const result = data.content[0]?.text || "";

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
