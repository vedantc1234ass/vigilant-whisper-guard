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

2️⃣ Fake Voices & AI-Generated Audio
Detect:
- Voice cloning artifacts (unnatural smoothness, robotic undertones)
- Synthetic speech patterns
- Unnatural pauses, pitch patterns, or cadence
- Audio quality inconsistencies
- TTS (text-to-speech) signatures
Classify as: Voice deepfake/AI-generated, Voice cloning suspected, or Authentic human voice

3️⃣ Deepfake Videos
Detect:
- Lip-sync mismatches with audio
- Unnatural facial movements or expressions
- Blurring around face edges
- Inconsistent lighting on face vs background
- Eye blinking anomalies
- Facial warping or morphing artifacts
- Temporal inconsistencies between frames
Classify as: Video deepfake, Manipulated video, or Authentic video

4️⃣ Deepfake Images & AI-Generated Photos
Detect:
- GAN artifacts (grid patterns, noise patterns)
- Lighting/shadow inconsistencies
- Distorted facial symmetry
- Unnatural skin textures
- Background anomalies near edges
- Asymmetric earrings, glasses, or accessories
- Warped text or logos
Classify as: AI-generated image, Manipulated image, or Real image

5️⃣ Clean, Trusted-Looking Links
Detect:
- Brand impersonation (paypa1.com vs paypal.com)
- Domain similarity attacks (typosquatting)
- Hidden redirects
- Suspicious TLDs (.xyz, .tk, .ml for trusted brands)
- Mismatch between link text and actual URL
- URL shorteners hiding destination
- Homograph attacks (using similar-looking characters)
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
  "manipulation_tags": ["urgency", "authority", "personalization", "fear", "request_money", "implied_consequence", "deepfake", "voice_clone", "phishing_link", ...],
  "explanation": "Simple, human-readable explanation of WHY this was flagged (2-4 sentences). If media was analyzed, EXPLICITLY state whether the person/voice appears to be REAL or DEEPFAKE/AI-GENERATED.",
  "safe_rewrite": "Short rewritten message that removes manipulation and includes verification steps",
  "next_actions": ["Recommended action 1", "Recommended action 2", "Recommended action 3"],
  "evidence": [
    { "source": "text" | "vision" | "speech" | "ml" | "link", "reason": "One-line evidence reason", "confidence": 0-100 }
  ],
  "deepfake_analysis": {
    "contains_person": true | false,
    "is_deepfake": true | false | null,
    "deepfake_confidence": 0-100,
    "deepfake_type": "face_swap" | "lip_sync" | "full_synthetic" | "voice_clone" | "none" | null,
    "artifacts_found": ["list of specific artifacts detected"],
    "person_assessment": "Detailed assessment of the person - are they real or AI-generated?"
  },
  "link_analysis": {
    "urls_found": ["list of URLs extracted"],
    "suspicious_urls": ["list of suspicious URLs with reasons"],
    "brand_impersonation": true | false,
    "typosquatting_detected": true | false
  },
  "meta": {
    "channel": "email" | "chat" | "voice" | "sms" | "other",
    "sender_name": "string or null",
    "timestamp": "ISO8601 or null",
    "media_analyzed": ["image" | "video" | "audio"]
  }
}

⚖️ RESPONSIBLE AI REQUIREMENTS
- Do NOT store personal data
- Avoid biased assumptions
- Clearly state uncertainty if confidence is low
- Provide safety-first recommendations

🎯 PRIMARY GOAL
Protect users from next-generation AI-powered cyber attacks that look real, trusted, and human — before damage occurs.

🎯 CRITICAL FOR DEEPFAKE DETECTION
When analyzing images, videos, or audio of people:
1. ALWAYS explicitly state if the person appears REAL or AI-GENERATED/DEEPFAKE
2. List specific visual or audio artifacts that led to your conclusion
3. Assign a confidence score to your deepfake assessment
4. If unsure, say "Inconclusive" and explain what additional verification is needed

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no additional text.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, channel, hasImage, hasAudio, hasVideo, imageBase64, audioBase64, videoBase64 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Extract URLs from text for link analysis
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|org|net|io|co|xyz|tk|ml|ga|cf|info|biz|online|site|app|dev)[^\s]*)/gi;
    const extractedUrls = text ? text.match(urlRegex) || [] : [];

    // Build context about what media was provided
    let mediaContext = "";
    const mediaAnalyzed: string[] = [];
    
    if (hasImage) {
      mediaContext += "\n[IMAGE PROVIDED - Analyze for deepfake artifacts, GAN patterns, facial anomalies, and AI generation signs. EXPLICITLY state if the person is REAL or DEEPFAKE.]";
      mediaAnalyzed.push("image");
    }
    if (hasAudio) {
      mediaContext += "\n[AUDIO PROVIDED - Analyze for voice cloning, synthetic speech, TTS artifacts, and unnatural patterns. EXPLICITLY state if the voice is REAL or AI-GENERATED.]";
      mediaAnalyzed.push("audio");
    }
    if (hasVideo) {
      mediaContext += "\n[VIDEO PROVIDED - Analyze for lip-sync issues, facial movement anomalies, deepfake artifacts, and AI generation. EXPLICITLY state if the person is REAL or DEEPFAKE.]";
      mediaAnalyzed.push("video");
    }
    if (extractedUrls.length > 0) {
      mediaContext += `\n[URLS DETECTED - Analyze these URLs for phishing, typosquatting, and brand impersonation: ${extractedUrls.join(", ")}]`;
    }

    const textPrompt = `Analyze this ${channel} message for threats:

Message Content:
${text || "[No text provided]"}

Channel: ${channel}
${mediaContext}

${hasImage ? "🔍 IMAGE ANALYSIS REQUIRED: Look for deepfake artifacts, unnatural facial features, GAN patterns, lighting inconsistencies. Tell me if the person is REAL or FAKE." : ""}
${hasAudio ? "🔍 AUDIO ANALYSIS REQUIRED: Listen for voice cloning artifacts, synthetic speech patterns, unnatural cadence. Tell me if the voice is REAL or AI-GENERATED." : ""}
${hasVideo ? "🔍 VIDEO ANALYSIS REQUIRED: Check for lip-sync issues, facial warping, temporal inconsistencies. Tell me if the person is REAL or DEEPFAKE." : ""}
${extractedUrls.length > 0 ? `🔍 LINK ANALYSIS REQUIRED: Check these URLs for phishing attempts: ${extractedUrls.join(", ")}` : ""}

Analyze this content thoroughly and return your threat assessment as JSON. Be EXPLICIT about whether any person/voice is real or AI-generated.`;

    // Build message content - multimodal if media is present
    const contentParts: any[] = [{ type: "text", text: textPrompt }];
    
    if (imageBase64) {
      contentParts.push({ 
        type: "image_url", 
        image_url: { url: imageBase64 } 
      });
    }
    
    if (videoBase64) {
      // For video, we send it as a video type or as image frames
      contentParts.push({ 
        type: "image_url", 
        image_url: { url: videoBase64 } 
      });
    }
    
    if (audioBase64) {
      // Add audio context - note: actual audio analysis depends on model support
      contentParts.push({ 
        type: "image_url", 
        image_url: { url: audioBase64 } 
      });
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
          { role: "system", content: GENSTAR_SYSTEM_PROMPT },
          { role: "user", content: contentParts },
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
        deepfake_analysis: {
          contains_person: false,
          is_deepfake: null,
          deepfake_confidence: 0,
          deepfake_type: null,
          artifacts_found: [],
          person_assessment: "Unable to determine"
        },
        link_analysis: {
          urls_found: extractedUrls,
          suspicious_urls: [],
          brand_impersonation: false,
          typosquatting_detected: false
        },
        meta: { channel, sender_name: null, timestamp: new Date().toISOString(), media_analyzed: mediaAnalyzed }
      };
    }

    // Ensure required fields have defaults
    analysisResult.product = "GenStar";
    analysisResult.used_services = analysisResult.used_services || ["Azure OpenAI", "Azure AI Vision", "Azure AI Speech", "Azure Machine Learning"];
    analysisResult.meta = {
      ...analysisResult.meta,
      channel,
      timestamp: analysisResult.meta?.timestamp || new Date().toISOString(),
      media_analyzed: mediaAnalyzed
    };
    
    // Ensure deepfake_analysis exists
    if (!analysisResult.deepfake_analysis) {
      analysisResult.deepfake_analysis = {
        contains_person: false,
        is_deepfake: null,
        deepfake_confidence: 0,
        deepfake_type: null,
        artifacts_found: [],
        person_assessment: "No media analyzed"
      };
    }
    
    // Ensure link_analysis exists
    if (!analysisResult.link_analysis) {
      analysisResult.link_analysis = {
        urls_found: extractedUrls,
        suspicious_urls: [],
        brand_impersonation: false,
        typosquatting_detected: false
      };
    }

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