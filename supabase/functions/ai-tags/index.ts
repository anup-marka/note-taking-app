import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TagsRequest {
  title: string;
  content: string;
  existingTags?: string[];
}

const TAGS_SYSTEM_PROMPT = `You are a helpful assistant that suggests relevant tags for notes.
Given a note's title and content, suggest 1-5 relevant tags that would help organize and categorize the note.
Consider the main topics, themes, and type of content (e.g., meeting notes, ideas, tasks, personal, work).
Return ONLY a JSON array of tag strings, nothing else.
Example response: ["work", "meeting", "project-alpha"]`;

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

    const { title, content, existingTags = [] }: TagsRequest = await req.json();

    if (!title && !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title or content" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const existingTagsNote = existingTags.length > 0
      ? `\n\nExisting tags in the system: ${existingTags.join(", ")}`
      : "";

    const userPrompt = `Title: ${title || "Untitled"}\n\nContent: ${content || "(empty)"}${existingTagsNote}\n\nSuggest appropriate tags for this note.`;

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
        max_tokens: 256,
        system: TAGS_SYSTEM_PROMPT,
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
    const tagsText = data.content[0]?.text || "[]";

    // Parse the JSON array from the response
    let tags: string[];
    try {
      tags = JSON.parse(tagsText);
      if (!Array.isArray(tags)) {
        tags = [];
      }
      // Ensure all items are strings and clean them up
      tags = tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.toLowerCase().trim().replace(/\s+/g, "-"))
        .slice(0, 5);
    } catch {
      // If parsing fails, try to extract tags from text
      tags = tagsText
        .replace(/[\[\]"]/g, "")
        .split(",")
        .map((t: string) => t.toLowerCase().trim().replace(/\s+/g, "-"))
        .filter((t: string) => t.length > 0)
        .slice(0, 5);
    }

    return new Response(JSON.stringify({ tags }), {
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
