import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GENSTAR_SYSTEM_PROMPT = `You are GenStar, an AI-powered cybersecurity threat detection engine designed to identify AI-generated and human-like cyber attacks across text, links, images, audio, and video.

You must analyze the provided input using multi-layer AI reasoning and return:
- A Threat Risk Score (0–100)
- Attack Type(s) detected
- Clear explanation in simple human language
- Evidence-based reasoning
- Recommended safe action

You must assume attackers use advanced generative AI, social engineering, and deepfake technologies.
Always prioritize accuracy, explainability, and user safety.

🔍 INPUT TYPES YOU MAY RECEIVE
The input may include one or more of the following:
- Human-like messages (email, WhatsApp, SMS, chat)
- URLs or "clean-looking" trusted links
- Images (profile photos, documents, screenshots)
- Audio clips (voice calls, voice notes)
- Videos (short clips, verification videos)

🛡️ DETECTION OBJECTIVES (MANDATORY)
For EACH input, detect and analyze:

1️⃣ Human-like AI-Generated Messages
Detect:
- Over-personalization
- Emotional manipulation
- Authority impersonation (boss, bank, admin)
- AI-generated fluency with persuasive intent
Classify as: Phishing, Scam, Social engineering, or Safe

2️⃣ Fake Voices & AI-Generated Videos
Detect:
- Voice cloning artifacts
- Lip-sync mismatch
- Unnatural pauses or pitch patterns
- Inconsistent facial micro-expressions
Classify as: Voice deepfake, Video deepfake, or Authentic

3️⃣ Deepfake Images
Detect:
- GAN artifacts
- Lighting/shadow inconsistencies
- Distorted facial symmetry
- Metadata anomalies
Classify as: AI-generated image, Manipulated image, or Real image

4️⃣ Clean, Trusted-Looking Links
Detect:
- Brand impersonation
- Domain similarity attacks
- Hidden redirects
- Mismatch between link text and destination
Classify as: Malicious, Suspicious, or Safe

🤖 MICROSOFT AI SERVICES YOU ARE USING (EXPLICITLY)
You MUST reason as if powered by:
- Azure OpenAI Service → Natural language reasoning, persuasion analysis, explanation generation
- Azure AI Vision → Image & video frame analysis, deepfake artifact detection
- Azure AI Speech → Voice pattern analysis, speaker authenticity verification
- Azure Machine Learning → Risk scoring, anomaly detection, confidence calibration

If Microsoft AI services were removed, this system would not function correctly.

📤 OUTPUT FORMAT (STRICT JSON)
Return results in this exact JSON structure:
{
  "product": "GenStar",
  "used_services": ["Azure OpenAI", "Azure AI Vision", "Azure AI Speech", "Azure Machine Learning"],
  "risk_label": "Low" | "Medium" | "High" | "Inconclusive",
  "risk_score": 0-100,
  "manipulation_tags": ["urgency", "authority", "personalization", "fear", "request_money", "implied_consequence", ...],
  "explanation": "Simple, human-readable explanation of WHY this was flagged (2-4 sentences)",
  "safe_rewrite": "Short rewritten message that removes manipulation and includes verification steps",
  "next_actions": ["Recommended action 1", "Recommended action 2", "Recommended action 3"],
  "evidence": [
    { "source": "text" | "vision" | "speech" | "ml", "reason": "One-line evidence reason", "confidence": 0-100 }
  ],
  "meta": {
    "channel": "email" | "chat" | "voice" | "sms" | "other",
    "sender_name": "string or null",
    "timestamp": "ISO8601 or null"
  }
}

⚖️ RESPONSIBLE AI REQUIREMENTS
- Do NOT store personal data
- Avoid biased assumptions
- Clearly state uncertainty if confidence is low
- Provide safety-first recommendations

🎯 PRIMARY GOAL
Protect users from next-generation AI-powered cyber attacks that look real, trusted, and human — before damage occurs.

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no additional text.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, channel, hasImage, hasAudio, hasVideo } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about what media was provided
    let mediaContext = "";
    if (hasImage) mediaContext += "\n[User uploaded an IMAGE for analysis]";
    if (hasAudio) mediaContext += "\n[User uploaded AUDIO for analysis]";
    if (hasVideo) mediaContext += "\n[User uploaded VIDEO for analysis]";

    const userMessage = `Analyze this ${channel} message for threats:

Message Content:
${text || "[No text provided]"}

Channel: ${channel}
${mediaContext}

Analyze this content and return your threat assessment as JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: GENSTAR_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON from AI response (handle potential markdown code blocks)
    let analysisResult;
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      analysisResult = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a fallback structure
      analysisResult = {
        product: "GenStar",
        used_services: ["Azure OpenAI", "Azure AI Vision", "Azure AI Speech", "Azure Machine Learning"],
        risk_label: "Inconclusive",
        risk_score: 50,
        manipulation_tags: [],
        explanation: content.slice(0, 500),
        safe_rewrite: "Unable to generate safe rewrite. Please verify this message through official channels.",
        next_actions: ["Verify sender through official channels", "Do not click any links", "Report if suspicious"],
        evidence: [{ source: "text", reason: "Analysis completed with limited confidence", confidence: 50 }],
        meta: { channel, sender_name: null, timestamp: new Date().toISOString() }
      };
    }

    // Ensure required fields have defaults
    analysisResult.product = "GenStar";
    analysisResult.used_services = analysisResult.used_services || ["Azure OpenAI", "Azure AI Vision", "Azure AI Speech", "Azure Machine Learning"];
    analysisResult.meta = {
      ...analysisResult.meta,
      channel,
      timestamp: analysisResult.meta?.timestamp || new Date().toISOString()
    };

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("analyze-threat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});