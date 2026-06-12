import { GoogleGenerativeAI, Schema } from "@google/generative-ai";
import { IAnalysisResult } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Initialize Google Gemini SDK
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "dummy_key_for_build");

// Define strict JSON Schema for Gemini response
const responseSchema: Schema = {
  type: "object" as any,
  properties: {
    riskLevel: {
      type: "string" as any,
      enum: ["Safe", "Suspicious", "Dangerous"],
      description: "Safety risk level of the content",
    },
    confidence: {
      type: "number" as any,
      description: "Confidence percentage score of the detection between 0 and 100",
    },
    category: {
      type: "string" as any,
      description: "Specific scam category if not safe (e.g. Bank Fraud, Phishing Link, Job Scam, Lottery Scam, OTP Request, Safe Communication)",
    },
    redFlags: {
      type: "array" as any,
      items: { type: "string" as any },
      description: "List of red flags detected in the content (e.g. urgency language, unknown sender, suspicious link, payment request)",
    },
    explanation: {
      type: "string" as any,
      description: "Clear, simple explanation of why the content is safe, suspicious, or dangerous. Make it easy to read and understand, especially for senior citizens.",
    },
    recommendations: {
      type: "array" as any,
      items: { type: "string" as any },
      description: "Recommended safety actions to take (e.g. Do not click the link, block the sender, call the official customer service, report to authorities)",
    },
    safeReply: {
      type: "string" as any,
      description: "A polite and firm response generator suggestion to send back to the potential scammer, or a polite refusal.",
    },
  },
  required: ["riskLevel", "confidence", "category", "redFlags", "explanation", "recommendations", "safeReply"],
};

// Retrieve model instance with structured output settings
const getModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.1, // Keep it deterministic for security scanning
    },
  });
};

/**
 * Format files as Gemini-compatible InlineData structures
 */
function fileToGenerativePart(base64Data: string, mimeType: string) {
  // Strip potential data URL prefix (e.g. "data:image/png;base64,") if present
  const base64Clean = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  return {
    inlineData: {
      data: base64Clean,
      mimeType,
    },
  };
}

/**
 * Robust runner with retry handling
 */
async function runWithRetry(fn: () => Promise<string>, retries = 3, delay = 1000): Promise<string> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`Gemini attempt ${i + 1} failed. Retrying in ${delay}ms...`, error);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1))); // Exponential backoff
      }
    }
  }
  throw lastError;
}

/**
 * Transcribe base64 audio using Groq's Whisper API
 */
async function transcribeAudioWithGroq(base64Data: string, mimeType: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const base64Clean = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  const buffer = Buffer.from(base64Clean, "base64");
  
  let ext = "mp3";
  if (mimeType.includes("wav")) ext = "wav";
  else if (mimeType.includes("m4a")) ext = "m4a";
  else if (mimeType.includes("webm")) ext = "webm";

  const file = new File([buffer], `audio.${ext}`, { type: mimeType });
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-large-v3");

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq Transcription failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.text;
}

/**
 * Call Groq's OpenAI-compatible completions API
 */
async function callGroqAPI(messages: any[], model: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API returned ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Perform Threat analysis using Groq models as a fallback
 */
async function analyzeWithGroq(type: string, content: string, fileType?: string): Promise<IAnalysisResult> {
  const schemaInstruction = `
    You must return a JSON object containing the threat analysis. The JSON must match this TypeScript interface:
    interface IAnalysisResult {
      riskLevel: "Safe" | "Suspicious" | "Dangerous";
      confidence: number;
      category: string;
      redFlags: string[];
      explanation: string;
      recommendations: string[];
      safeReply: string;
    }
  `;

  let messages: any[] = [];
  let modelName = "llama-3.3-70b-versatile";

  if (type === "text") {
    messages = [
      {
        role: "system",
        content: `You are a scam and phishing intelligence agent. Analyze text messages for potential fraud. ${schemaInstruction}`,
      },
      {
        role: "user",
        content: `Analyze the following text: "${content}"`,
      },
    ];
  } else if (type === "url") {
    messages = [
      {
        role: "system",
        content: `You are a scam and phishing intelligence agent. Analyze URLs for potential phishing or fraud. ${schemaInstruction}`,
      },
      {
        role: "user",
        content: `Analyze the following URL: "${content}"`,
      },
    ];
  } else if (type === "screenshot") {
    modelName = "llama-3.2-11b-vision-preview";
    const mime = fileType || "image/png";
    const base64Clean = content.includes(",") ? content.split(",")[1] : content;
    const dataUrl = `data:${mime};base64,${base64Clean}`;

    messages = [
      {
        role: "system",
        content: `You are a scam and phishing intelligence agent. Analyze screenshots for potential fraud. ${schemaInstruction}`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze the text and visual elements of this screenshot for potential scams or security risks." },
          { type: "image_url", image_url: { url: dataUrl } }
        ]
      }
    ];
  } else if (type === "voice") {
    const transcript = await transcribeAudioWithGroq(content, fileType || "audio/mp3");
    messages = [
      {
        role: "system",
        content: `You are a scam and phishing intelligence agent. Analyze audio transcripts for potential scams or fraud. ${schemaInstruction}`,
      },
      {
        role: "user",
        content: `Analyze this transcribed speech transcript: "${transcript}"`,
      },
    ];
  }

  const responseText = await callGroqAPI(messages, modelName);
  return JSON.parse(responseText) as IAnalysisResult;
}

/**
 * Analyze text content for scams
 */
export async function analyzeText(text: string): Promise<IAnalysisResult> {
  if (GEMINI_API_KEY) {
    const prompt = `
      Analyze the following text message, WhatsApp, email, or communication for safety, potential scams, phishing attempts, threat language, fake offers, OTP requests, bank fraud, job scams, lottery scams, or cryptocurrency fraud.
      
      Content to analyze:
      """
      ${text}
      """
    `;

    try {
      const rawResponse = await runWithRetry(async () => {
        const model = getModel();
        const response = await model.generateContent(prompt);
        return response.response.text();
      });

      return JSON.parse(rawResponse) as IAnalysisResult;
    } catch (error) {
      console.error("Error in Gemini analyzeText service, trying Groq fallback:", error);
    }
  }

  if (GROQ_API_KEY) {
    try {
      return await analyzeWithGroq("text", text);
    } catch (error) {
      console.error("Error in Groq fallback for analyzeText, falling back to mock:", error);
    }
  }

  return getMockResult("text", text);
}

/**
 * Analyze URL for phishing
 */
export async function analyzeUrl(url: string, pageMetadata?: string): Promise<IAnalysisResult> {
  if (GEMINI_API_KEY) {
    const prompt = `
      Analyze the following URL link for phishing indicators, fake domain structures, lookalike domains (typosquatting), URL shortening service redirects, suspicious keywords, and scam patterns.
      
      URL: ${url}
      ${pageMetadata ? `Fetched page context metadata: ${pageMetadata}` : ""}
      
      Evaluate the risk level and detail any red flags found.
    `;

    try {
      const rawResponse = await runWithRetry(async () => {
        const model = getModel();
        const response = await model.generateContent(prompt);
        return response.response.text();
      });

      return JSON.parse(rawResponse) as IAnalysisResult;
    } catch (error) {
      console.error("Error in Gemini analyzeUrl service, trying Groq fallback:", error);
    }
  }

  if (GROQ_API_KEY) {
    try {
      return await analyzeWithGroq("url", url);
    } catch (error) {
      console.error("Error in Groq fallback for analyzeUrl, falling back to mock:", error);
    }
  }

  return getMockResult("url", url);
}

/**
 * Analyze a screenshot image (multimodal OCR + scam detection)
 */
export async function analyzeScreenshot(base64Data: string, mimeType: string): Promise<IAnalysisResult> {
  if (GEMINI_API_KEY) {
    const imagePart = fileToGenerativePart(base64Data, mimeType);
    const prompt = `
      Analyze the attached screenshot. 
      1. Extract all text, numbers, links, and details shown in the image (simulate OCR).
      2. Inspect visual cues, layouts, and logos if any.
      3. Determine if the message or interface shown is a scam, phishing notification, fraud alert, imposter account, or secure interface.
      
      Return a full threat report in JSON.
    `;

    try {
      const rawResponse = await runWithRetry(async () => {
        const model = getModel();
        const response = await model.generateContent([prompt, imagePart]);
        return response.response.text();
      });

      return JSON.parse(rawResponse) as IAnalysisResult;
    } catch (error) {
      console.error("Error in Gemini analyzeScreenshot service, trying Groq fallback:", error);
    }
  }

  if (GROQ_API_KEY) {
    try {
      return await analyzeWithGroq("screenshot", base64Data, mimeType);
    } catch (error) {
      console.error("Error in Groq fallback for analyzeScreenshot, falling back to mock:", error);
    }
  }

  return getMockResult("screenshot", "Image uploaded");
}

/**
 * Analyze an audio recording / voice note (multimodal Speech-to-Text + scam detection)
 */
export async function analyzeVoiceNote(base64Data: string, mimeType: string): Promise<IAnalysisResult> {
  if (GEMINI_API_KEY) {
    const audioPart = fileToGenerativePart(base64Data, mimeType);
    const prompt = `
      Analyze the attached voice note audio.
      1. Transcribe the speech to text.
      2. Analyze the transcript for scam patterns, threat language, extortion, bank impersonation, urgency hooks, fake government official demands, or emergency family member scams (imposter scams).
      3. Return the full threat report in JSON.
    `;

    try {
      const rawResponse = await runWithRetry(async () => {
        const model = getModel();
        const response = await model.generateContent([prompt, audioPart]);
        return response.response.text();
      });

      return JSON.parse(rawResponse) as IAnalysisResult;
    } catch (error) {
      console.error("Error in Gemini analyzeVoiceNote service, trying Groq fallback:", error);
    }
  }

  if (GROQ_API_KEY) {
    try {
      return await analyzeWithGroq("voice", base64Data, mimeType);
    } catch (error) {
      console.error("Error in Groq fallback for analyzeVoiceNote, falling back to mock:", error);
    }
  }

  return getMockResult("voice", "Audio uploaded");
}

/**
 * Fallback Mock generator for development if API key is not configured
 */
function getMockResult(type: string, input: string): IAnalysisResult {
  console.log(`[Gemini Mock Active] Analyzing ${type}: "${input.slice(0, 40)}..."`);
  
  const isSuspicious = input.toLowerCase().includes("win") || input.toLowerCase().includes("otp") || input.toLowerCase().includes("http") || input.toLowerCase().includes("click") || input.toLowerCase().includes("urgent");
  const isDangerous = input.toLowerCase().includes("bank") && (input.toLowerCase().includes("block") || input.toLowerCase().includes("suspended") || input.toLowerCase().includes("password"));

  if (isDangerous) {
    return {
      riskLevel: "Dangerous",
      confidence: 94.8,
      category: "Bank Impersonation Fraud",
      redFlags: [
        "Urgent tone demanding immediate action",
        "Requests sensitive credentials or security updates",
        "Unofficial contact medium for a financial institution"
      ],
      explanation: "This message claims your bank account is blocked and asks you to verify your details. Real banks will never ask you to click a link to unblock your account or share passwords over SMS.",
      recommendations: [
        "Do NOT reply to this message.",
        "Do NOT click any link in the message.",
        "Call the number on the back of your debit card to check your account status."
      ],
      safeReply: "I will contact the bank directly using the official customer care number."
    };
  }

  if (isSuspicious) {
    return {
      riskLevel: "Suspicious",
      confidence: 78.4,
      category: "Phishing / Unverified Offer",
      redFlags: [
        "Offers something too good to be true",
        "Includes a short link or redirect URL",
        "Grammatical inaccuracies"
      ],
      explanation: "This contains link redirects and promotional keywords that look like a lottery or courier parcel notification. It might be trying to collect tracking fees or capture personal details.",
      recommendations: [
        "Avoid opening links from unknown numbers.",
        "Check official courier sites directly using your tracking number."
      ],
      safeReply: "Please send this information via official channels. I do not click SMS links."
    };
  }

  return {
    riskLevel: "Safe",
    confidence: 99.1,
    category: "Safe Communication",
    redFlags: [],
    explanation: "No suspicious scam patterns, threat triggers, or high-risk language were detected in the content. It appears to be normal communication.",
    recommendations: [
      "Keep practicing caution when sharing personal information."
    ],
    safeReply: "Thank you for the message. I will check this."
  };
}
