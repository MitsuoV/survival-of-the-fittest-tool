
import { GoogleGenAI, Type } from "@google/genai";
import { Environment, Trait } from "../types";

export const generateSpeciesData = async (env: Environment, traits: Trait[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const traitNames = traits.map(t => t.name).join(', ');
  const prompt = `Act as a world-class evolutionary biologist. 
  
  ENVIRONMENT: "${env.name}"
  ENVIRONMENTAL CHALLENGES: ${env.challenges}
  SELECTED EVOLUTIONARY TRAITS: [${traitNames}]
  
  TASK:
  1. Create a scientifically plausible fictional species that evolved specifically in this environment using these traits.
  2. Explain the anatomical and physiological synergies. For example, how does trait A support trait B in this specific climate?
  3. Use academic, biological terminology. Avoid any mention of magic, monsters, or fantasy. 
  4. Ensure the survival strategy is grounded in real-world principles of natural selection.
  
  Provide a detailed field report including a scientific name (Latin-style).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating species data.";
  }
};

export const generateSpeciesImage = async (env: Environment, traits: Trait[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const traitDetails = traits.map(t => t.name).join(', ');
  const imagePrompt = `A professional biology textbook illustration of a new species discovered in the ${env.name}. 
  ANATOMY: The specimen exhibits ${traitDetails}. 
  STYLE: Carbon dust scientific illustration or high-end nature documentary still. 
  ENVIRONMENT: Showing the specimen in its natural habitat (${env.climate}).
  CONSTRAINTS: 
  - MUST BE biologically plausible. 
  - NO fantasy, NO glowing magic, NO chimeric monsters, NO wings unless biologically justified for the weight. 
  - Clean composition, focused on anatomical detail. 
  - Background is a realistic ecosystem. 
  - Biology field guide aesthetic.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: imagePrompt,
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};

export const analyzeEvolutionaryViability = async (env: Environment, traits: Trait[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const traitNames = traits.map(t => t.name).join(', ');
  const prompt = `Act as an evolutionary viability analysis engine. 
  Analyze the survival of a species in the ${env.name} (${env.challenges}) with traits: [${traitNames}].
  
  Return the analysis in a strictly structured JSON format following these biological rules:
  1. Quantify survival in number of generations.
  2. Map traits to beneficial/detrimental impacts.
  3. Identify one major trade-off.
  4. Use academic, objective language.
  
  JSON Schema:
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
