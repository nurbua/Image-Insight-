import { GoogleGenAI, Type } from "@google/genai";
import type { LiteraryExcerpt, Tone, ContentType } from "../types";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateContent = async (
  ai: GoogleGenAI,
  file: File,
  options: { tone: Tone, contentTypes: ContentType[] }
) => {
  if (options.contentTypes.length === 0) {
    return { titles: [], captions: [], excerpts: [] };
  }

  const imagePart = await fileToGenerativePart(file);

  let prompt = `Analyse cette image et fournis les informations suivantes en français, avec un ton ${options.tone}. Réponds uniquement avec un seul objet JSON.`;

  const properties: any = {};
  const required: string[] = [];

  if (options.contentTypes.includes('titles')) {
    prompt += `\n1. 'titles': Un tableau de 2-3 chaînes de caractères pour des titres créatifs.`;
    properties.titles = {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    };
    required.push('titles');
  }

  if (options.contentTypes.includes('captions')) {
    prompt += `\n2. 'captions': Un tableau de 2-3 chaînes de caractères pour des légendes courtes pour les réseaux sociaux.`;
    properties.captions = {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    };
    required.push('captions');
  }

  if (options.contentTypes.includes('excerpts')) {
    prompt += `\n3. 'excerpts': Un tableau de 2 objets pour des extraits littéraires. Chaque objet doit contenir 'extrait', 'auteur', 'oeuvre', et 'traduction'. Si l'extrait original est en français, le champ 'traduction' doit être une chaîne vide.`;
    properties.excerpts = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          extrait: { type: Type.STRING },
          traduction: { type: Type.STRING },
          auteur: { type: Type.STRING },
          oeuvre: { type: Type.STRING },
        },
        required: ['extrait', 'auteur', 'oeuvre', 'traduction']
      }
    };
    required.push('excerpts');
  }

  const schema = {
    type: Type.OBJECT,
    properties,
    required,
  };

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
          responseMimeType: 'application/json',
          responseSchema: schema
      }
  });
  
  try {
    const text = response.text.trim();
    const parsedJson = JSON.parse(text);

    return {
      titles: parsedJson.titles || [],
      captions: parsedJson.captions || [],
      excerpts: parsedJson.excerpts || [],
    } as {
      titles: string[];
      captions: string[];
      excerpts: LiteraryExcerpt[];
    };
  } catch (e) {
      console.error("Failed to parse JSON from Gemini:", e);
      console.error("Raw response text:", response.text);
      throw new Error("Réponse invalide de l'API Gemini.");
  }
};
