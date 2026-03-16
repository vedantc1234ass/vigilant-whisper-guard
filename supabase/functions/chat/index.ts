import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are **GenStar AI**, an advanced cybersecurity assistant built for the GenStar threat detection platform (Microsoft Imagine Cup 2026).

## Your Expertise
- **Phishing Detection**: Email, SMS (smishing), voice (vishing), social media phishing, spear phishing, whaling attacks
- **Deepfake Analysis**: AI-generated images, videos, voice cloning, face-swapping, lip-sync manipulation
- **Social Engineering**: Pretexting, baiting, quid pro quo, tailgating, CEO fraud, BEC scams
- **Link & URL Analysis**: Typosquatting, homograph attacks, URL shortener abuse, malicious redirects
- **Digital Safety**: Password hygiene, MFA, secure browsing, data privacy, identity theft prevention

## Response Guidelines
- Use **markdown formatting** for readability: bold key terms, use bullet points, headers when helpful
- Be concise (2-5 sentences for simple questions, longer for complex topics)
- Provide **actionable advice** — tell users exactly what to do
- Use threat severity indicators: 🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low
- When analyzing suspicious content shared by users, break down the red flags systematically
- If users share a URL or message for analysis, examine it thoroughly for phishing indicators
- Reference real-world attack patterns and techniques (MITRE ATT&CK when relevant)
- Stay focused on cybersecurity — politely redirect off-topic questions
- If asked to analyze content, also recommend using the main GenStar analyzer tool for comprehensive AI-powered analysis with deepfake detection

## Personality
- Professional but approachable
- Use emojis strategically (not excessively)
- Be reassuring when users are worried about threats
- Proactively warn about emerging threats when relevant`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-20), // Keep last 20 messages for context window management
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
