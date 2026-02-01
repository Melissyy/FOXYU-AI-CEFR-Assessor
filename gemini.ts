mport { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Convert blob to base64
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve) => {
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
  });
  reader.readAsDataURL(audioBlob);
  const base64Data = await base64Promise;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: audioBlob.type } },
        { text: "Transcribe this audio exactly as it is spoken. Do not add any commentary." }
      ]
    }
  });

  return response.text || "No transcription available.";
};

export const assessEnglishLevel = async (
  transcriptions: { [key: number]: string },
  systemPrompt: string
): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const userPrompt = `
    Now analyze the following transcriptions:
    Answer 1: "${transcriptions[1]}"
    Answer 2: "${transcriptions[2]}"
    Answer 3: "${transcriptions[3]}"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse JSON assessment", e);
    throw new Error("Invalid assessment format received from AI.");
  }
};
