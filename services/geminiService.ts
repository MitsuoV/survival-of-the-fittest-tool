
import { GoogleGenAI, Type } from "@google/genai";
import { Environment, Trait } from "../types";

export const generateSpeciesData = async (env: Environment, traits: Trait[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Configuration error: API Key not found.";
  
  const ai = new GoogleGenAI({ apiKey });
  const traitNames = traits.map(t => t.name).join(', ');
  const prompt = `Act as a world-class evolutionary biologist. 
  
  ENVIRONMENT: "${env.name}"
  ENVIRONMENTAL CHALLENGES: ${env.challenges}
  SELECTED EVOLUTIONARY TRAITS: [${traitNames}]
  
  TASK:
  1. Create a scientifically plausible fictional species that evolved specifically in this environment using these traits.
  2. Explain the anatomical and physiological synergies.
  3. Use academic, biological terminology.
  
  Provide a detailed field report including a scientific name (Latin-style).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Text Generation Error:", error);
    return "Error generating species data.";
  }
};

export const generateSpeciesImage = async (env: Environment, traits: Trait[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  const traitDetails = traits.map(t => t.name).join(', ');
  
  const imagePrompt = `A ultra-high-definition, museum-quality scientific biological plate of a newly discovered species.
  ANATOMICAL FEATURES: ${traitDetails}.
  NATIVE HABITAT: The ${env.name} ecosystem (${env.climate}).
  ARTISTIC STYLE: Photorealistic scientific illustration, focused on anatomical precision, cinematic natural lighting. 8k resolution textures for skin/fur/scales. Professional biology field guide aesthetic. No text, watermark, or labels in the image.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: imagePrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    // Fix: Properly iterate candidates and parts to extract the inlineData base64 string
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64Data}`;
        }
      }
    }
    
    return null;
  } catch (error: any) {
    console.error("Pro Image Generation Error:", error);
    if (error?.message?.includes("Requested entity was not found") || error?.status === 404) {
      throw new Error("KEY_REQUIRED");
    }
    return null;
  }
};

export const analyzeEvolutionaryViability = async (env: Environment, traits: Trait[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  const traitNames = traits.map(t => t.name).join(', ');
  const prompt = `Perform a high-fidelity survival simulation for a species in ${env.name} with traits: [${traitNames}]. Return JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            generations: { type: Type.NUMBER },
            classification: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            limitations: { type: Type.ARRAY, items: { type: Type.STRING } },
            evolutionaryOutlook: { type: Type.STRING }
          },
          required: ["generations", "classification", "strengths", "limitations", "evolutionaryOutlook"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Analysis Error:", error);
    return null;
  }
};
