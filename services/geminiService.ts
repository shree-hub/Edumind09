
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { QuizQuestion, StudyNote, CurrentAffairs } from "../types";

export const fetchCurrentAffairs = async (language: string): Promise<CurrentAffairs> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Provide the top 5 most important daily current affairs news items for students in ${language}. 
                  Focus on global events, science, and economics. Format as a beautiful markdown article with headlines and bulleted summaries.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text || "Unable to fetch news at this moment.",
    language
  };
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanText = text.replace(/[*#]/g, '').substring(0, 1000);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Please read the following news summary clearly: ${cleanText}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }
        }
      }
    }
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const generateAdvancedNotes = async (topic: string, depth: 'standard' | 'upsc'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = depth === 'upsc' 
    ? `Generate UPSC Mains standard comprehensive notes for: ${topic}. Structure with Context, Detailed Analysis, Pros/Cons, Government Initiatives, and Way Forward. Use high-quality academic language.`
    : `Generate easy-to-understand study notes for: ${topic}. Use markdown headers, bullet points, and highlight key terms.`;

  const response = await ai.models.generateContent({
    model: depth === 'upsc' ? "gemini-3-pro-preview" : "gemini-3-flash-preview",
    contents: prompt
  });

  return response.text || "Failed to generate notes.";
};

export const generateAdvancedQuiz = async (config: { topic: string, exam: string, difficulty: string, count: number }): Promise<QuizQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Create a ${config.difficulty} level mock test for ${config.exam} on the topic: ${config.topic}. 
               Generate ${config.count} high-quality MCQs. Return strictly valid JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const askTutor = async (query: string, libraryContext: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a helpful AI Textbook Tutor. Context: ${libraryContext}. User query: ${query}`,
    config: {
      systemInstruction: "Be encouraging, educational, and concise."
    }
  });
  return response.text || "I couldn't generate an answer.";
};

export const generateStudyNotes = async (text: string): Promise<StudyNote> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze the provided textbook text and generate high-depth, UPSC Mains standard study notes. 
               The content must be detailed, including Context, Key Definitions, Deep Analysis, and an Exam Perspective.
               Format the 'content' field as a single string of high-quality Markdown.
               
               Text to analyze: ${text.substring(0, 12000)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING, description: "Detailed Markdown-formatted study notes" }
        },
        required: ["title", "content"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"title": "Study Notes", "content": ""}');
  } catch (e) {
    console.error("Failed to parse notes JSON", e);
    return { title: "Error", content: "AI failed to generate notes in the requested JSON format. Please try again." };
  }
};

export const generateMockTest = async (topic: string, count: number, difficulty: string): Promise<QuizQuestion[]> => {
  return generateAdvancedQuiz({ topic, count, difficulty, exam: "Reading Practice" });
};
