import { GoogleGenAI } from "@google/genai";

// Fallback story if API is not available or fails
const FALLBACK_STORY = "Dawno temu w małym domku żył wesoły kotek. Kotek miał na imię Mruczek. Lubił pić mleko i bawić się kłębkiem wełny. Pewnego dnia znalazł w ogrodzie małą myszkę. Myszka była bardzo szybka.";

export const generateStory = async (): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("API Key missing, using fallback story");
    return FALLBACK_STORY;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Napisz krótką, bardzo prostą historyjkę dla 7-letniej dziewczynki w języku polskim. Używaj prostych słów. Maksymalnie 50 słów. Nie używaj tytułów ani formatowania markdown, tylko czysty tekst.",
      config: {
        maxOutputTokens: 200,
        temperature: 0.7,
      }
    });

    const text = response.text;
    return text || FALLBACK_STORY;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return FALLBACK_STORY;
  }
};