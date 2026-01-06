import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, MultimediaInput } from "../types";

const apiKey = process.env.API_KEY;
// Initialize the client. We assume API_KEY is available in the environment.
const ai = new GoogleGenAI({ apiKey: apiKey });

export const analyzeSymptoms = async (
  text: string,
  image: MultimediaInput | null,
  audio: MultimediaInput | null
): Promise<AnalysisResult> => {
  
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const model = "gemini-3-pro-preview";

  const parts: any[] = [];

  // Add text prompt
  parts.push({
    text: `Analyze the following symptom inputs (Text, Image, and/or Audio) provided by the user.
    
    User Description: ${text || "No text description provided."}

    Task:
    1. Summarize the symptoms based on the multimodal input.
    2. Provide 3-5 specific wellness or actionable recommendations.
    3. Determine the urgency level (Low, Moderate, Critical) and provide a brief explanation.

    Context: You are a "Smart Health Companion". Be empathetic, professional, and clear.
    DISCLAIMER: You must strictly adhere to the response schema. 
    IMPORTANT: If the inputs are unclear or empty, ask the user to provide more details in the summary.`
  });

  // Add Image if exists
  if (image) {
    parts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data
      }
    });
  }

  // Add Audio if exists
  if (audio) {
    parts.push({
      inlineData: {
        mimeType: audio.mimeType,
        data: audio.data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        systemInstruction: "You are a specialized medical reasoning AI assistant. Your goal is to analyze symptoms and provide helpful, informational guidance. You are NOT a doctor. Always include a disclaimer that this is not medical advice.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A concise summary of the reported symptoms." },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 3-5 wellness or actionable recommendations."
            },
            alert: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.STRING, enum: ["Low", "Moderate", "Critical"] },
                details: { type: Type.STRING, description: "Brief explanation of the urgency level." }
              },
              required: ["level", "details"]
            }
          },
          required: ["summary", "recommendations", "alert"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(responseText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
