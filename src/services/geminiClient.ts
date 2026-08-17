import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

export const getAiClient = (): GoogleGenAI => {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
};

export interface GenerateOptions {
  contents: any;
  config?: any;
  model?: string;
  preferredModels?: string[];
  maxRetriesPerModel?: number;
}

/**
 * Call Gemini models with automatic retry, exponential backoff,
 * and automatic fallback if a model experiences 503 / 429 high demand spikes.
 */
export async function generateContentWithRetry(options: GenerateOptions) {
  const ai = getAiClient();
  const rawFallback = options.preferredModels || [
    options.model || "gemini-3.7-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ];

  // Allowed valid models
  const validAllowedModels = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
  const sanitizedChain = rawFallback
    .filter(m => Boolean(m) && !m.includes("2.5") && !m.includes("2.0") && !m.includes("1.5"))
    .filter(m => validAllowedModels.includes(m));

  if (!sanitizedChain.includes("gemini-3.7-flash")) {
    sanitizedChain.unshift("gemini-3.7-flash");
  }
  if (!sanitizedChain.includes("gemini-flash-latest")) {
    sanitizedChain.push("gemini-flash-latest");
  }

  const uniqueModels = Array.from(new Set(sanitizedChain));
  let lastError: any = null;

  for (let mIndex = 0; mIndex < uniqueModels.length; mIndex++) {
    const currentModel = uniqueModels[mIndex];
    const maxRetries = options.maxRetriesPerModel ?? 1;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: options.contents,
          config: options.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || "");
        const status = err?.status || err?.code;
        const isUnavailableOrRateLimited =
          status === 503 ||
          status === 429 ||
          status === "UNAVAILABLE" ||
          status === "RESOURCE_EXHAUSTED" ||
          msg.includes("503") ||
          msg.includes("429") ||
          msg.includes("high demand") ||
          msg.includes("quota") ||
          msg.includes("temporarily unavailable") ||
          msg.includes("overloaded");

        console.warn(
          `[Gemini Client] Model '${currentModel}' returned status ${status || 'ERR'} (attempt ${attempt + 1}/${maxRetries + 1}). Switching/retrying...`
        );

        if (isUnavailableOrRateLimited) {
          // If 503 or 429, don't stall unnecessarily; quickly try next model in fallback list
          if (mIndex < uniqueModels.length - 1) {
            console.log(`[Gemini Client] High demand on '${currentModel}', seamlessly switching to fallback model '${uniqueModels[mIndex + 1]}'`);
            break; // Switch to next model
          }

          if (attempt < maxRetries) {
            const delay = (attempt + 1) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        break;
      }
    }
  }

  throw lastError;
}

