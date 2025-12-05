import { GoogleGenAI, Type, FunctionDeclaration, Tool, Schema } from "@google/genai";
import { Paper, PhysicistName, ChatMessage, GroundingSource } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-build' });
};

// Schema for structured paper data
const paperSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The original title of the paper or publication." },
      year: { type: Type.INTEGER, description: "The year of publication." },
      description: { type: Type.STRING, description: "A brief 1-sentence summary of the paper's significance." },
    },
    required: ["title", "year", "description"],
  },
};

export const fetchPapersByPhysicist = async (physicist: PhysicistName): Promise<Omit<Paper, 'id' | 'physicist'>[]> => {
  const ai = createClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `List 6 of the most significant scientific papers or books by ${physicist}. Focus on their quantum mechanics contributions.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: paperSchema,
        temperature: 0.3,
      }
    });

    const text = response.text;
    if (!text) return [];
    
    // Clean potential markdown fences from the response before parsing
    const cleanText = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error fetching papers:", error);
    return [];
  }
};

export const generateRagResponse = async (
  history: ChatMessage[], 
  contextPapers: Paper[], 
  currentMessage: string
): Promise<{ text: string, sources: GroundingSource[] }> => {
  const ai = createClient();
  
  // Construct a system instruction that includes the "Collected" knowledge base
  const contextString = contextPapers.map(p => 
    `- "${p.title}" (${p.year}) by ${p.physicist}: ${p.description}`
  ).join('\n');

  const systemInstruction = `
    You are a specialized Quantum Physics Research Assistant.
    You have access to a specific collection of papers in the user's library:
    ${contextString}

    When answering:
    1. Prioritize information from the papers in the user's library.
    2. Use the Google Search tool to find specific citations, PDF links, or details about equations/content within these papers if asked.
    3. If the user asks about a paper NOT in the library, mention that it's not currently collected but answer generally.
    4. Provide clear, academic, yet accessible explanations.
  `;

  // Convert app history to Gemini format
  // We only take the last few turns to save context window and avoid complex history parsing issues
  const recentHistory = history.slice(-6).map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }], // Enable RAG/Grounding
      },
      history: recentHistory
    });

    const result = await chat.sendMessage({ message: currentMessage });
    
    // Extract text
    const responseText = result.text || "I couldn't generate a response.";

    // Extract grounding chunks (URLs)
    const sources: GroundingSource[] = [];
    
    // Check for grounding metadata in the candidate
    const candidate = result.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks;

    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return {
      text: responseText,
      sources
    };

  } catch (error) {
    console.error("Error in RAG chat:", error);
    return {
      text: "I encountered an error accessing the Quantum Archives. Please check your connection or API key.",
      sources: []
    };
  }
};