
import { GoogleGenAI, Type } from "@google/genai";
import { Environment, Trait } from "../types";

export const generateSpeciesImage = async (env: Environment, traits: Trait[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing.");
    return null;
  }

  // Use a fresh instance right before call as per best practices
  const ai = new GoogleGenAI({ apiKey: apiKey });
  const traitDetails = traits.map(t => t.name).join(', ');
  
  // High-fidelity prompt for scientific realism
  const imagePrompt = `Detailed scientific specimen illustration of a biological creature that evolved in a ${env.name} ecosystem. 
  Climate: ${env.climate}. Temperature: ${env.temperature}.
  Its unique physiological traits include: ${traitDetails}. 
  Visual style: Digital scientific field guide, hyper-realistic creature design, high anatomical detail, natural habitat background, 8k resolution.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ text: imagePrompt }] 
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Iterate through parts to find the image data
    const candidates = response.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    console.warn("No image found in Gemini response parts. Response structure:", response);
    return null;
  } catch (error) {
    console.error("Image Synthesis Failed:", error);
    return null;
  }
};

export const analyzeEvolutionaryViability = async (env: Environment, traits: Trait[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const traitNames = traits.map(t => t.name).join(', ');
  const prompt = `Analyze the survival probability and evolutionary future of a species in a ${env.name} with the following traits: [${traitNames}]. 
  Environmental constraints: ${env.challenges}, ${env.climate}, ${env.temperature}.
  
  Consider the synergy or conflict between these traits.
  Return strictly JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            generations: { type: Type.NUMBER, description: "Number of generations before extinction or stability." },
            classification: { type: Type.STRING, description: "One word status: Apex, Endangered, Thriving, or Extinct." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Why these traits help." },
            limitations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Vulnerabilities." },
            evolutionaryOutlook: { type: Type.STRING, description: "A detailed 2-sentence forecast." }
          },
          required: ["generations", "classification", "strengths", "limitations", "evolutionaryOutlook"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Survival Analysis Error:", error);
    return null;
  }
};
