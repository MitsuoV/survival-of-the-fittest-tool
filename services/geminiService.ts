
import { GoogleGenAI, Type } from "@google/genai";
import { Environment, Trait } from "../types";

export const generateSpeciesData = async (env: Environment, traits: Trait[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return "Configuration error: API Key not found.";
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const traitNames = traits.map(t => t.name).join(', ');
  const prompt = `Act as a world-class evolutionary biologist. 
  
  ENVIRONMENT: "${env.name}"
  ENVIRONMENTAL CHALLENGES: ${env.challenges}
  SELECTED EVOLUTIONARY TRAITS: [${traitNames}]
  
  TASK:
  1. Create a scientifically plausible fictional species that evolved specifically in this environment using these traits.
  2. Explain the anatomical and physiological synergies.
  3. Use academic, biological terminology. Avoid any mention of magic or fantasy.
  
  Provide a detailed field report including a scientific name (Latin-style).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Text Generation Error:", error);
    return "Error generating species data. Please check your API key and connection.";
  }
};

export const generateSpeciesImage = async (env: Environment, traits: Trait[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  const traitDetails = traits.map(t => t.name).join(', ');
  const imagePrompt = `A professional biology textbook illustration of a new species discovered in the ${env.name}. 
  ANATOMY: The specimen exhibits ${traitDetails}. 
  STYLE: Carbon dust scientific illustration or high-end nature documentary still. 
  ENVIRONMENT: Showing the specimen in its natural habitat (${env.climate}).
  CONSTRAINTS: MUST BE biologically plausible. Clean composition, focused on anatomical detail. Background is a realistic ecosystem. Biology field guide aesthetic.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: imagePrompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // The response.candidates[0].content.parts is the standard way to access parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    
    console.warn("No image part found in Gemini response.");
    return null;
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return null;
  }
};

export const analyzeEvolutionaryViability = async (env: Environment, traits: Trait[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  const traitNames = traits.map(t => t.name).join(', ');
  const prompt = `Analyze survival of a species in ${env.name} with traits: [${traitNames}].
  
  Return strictly JSON.
  Schema:
  {
    "generations": number,
    "classification": string,
    "strengths": string[],
    "limitations": string[],
    "evolutionaryOutlook": string
  }`;

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
