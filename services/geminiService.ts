import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { AnalysisData, HealthStatus, Language } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the response schema for the initial financial analysis
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: [HealthStatus.HEALTHY, HealthStatus.UNHEALTHY, HealthStatus.CAUTION],
      description: "The overall health status of the company.",
    },
    summary: {
      type: Type.STRING,
      description: "A summary of the financial situation spoken by a wise cat expert. Use a cute, encouraging but professional tone.",
    },
    metrics: {
      type: Type.ARRAY,
      description: "List of 4-6 key financial areas analyzed.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "e.g., Profitability, Cash Flow, Solvency" },
          term: { type: Type.STRING, description: "The professional financial term (e.g., Current Ratio, Net Margin)." },
          value: { type: Type.STRING, description: "The approximate value or qualitative assessment found in the report." },
          status: { type: Type.STRING, enum: ["Good", "Bad", "Neutral"] },
          explanation: { type: Type.STRING, description: "Brief professional explanation." },
          metaphor: { type: Type.STRING, description: "A simple metaphor to explain this concept to a layperson (e.g., comparing cash flow to blood circulation or food reserves)." },
        },
        required: ["category", "term", "value", "status", "explanation", "metaphor"],
      },
    },
  },
  required: ["status", "summary", "metrics"],
};

/**
 * Analyzes the financial report PDF and returns a structured JSON assessment.
 */
export const analyzeFinancialReport = async (base64Data: string, mimeType: string, lang: Language): Promise<AnalysisData> => {
  try {
    const modelId = "gemini-2.5-flash";

    const langInstruction = lang === 'zh' 
      ? "Language: Output strictly in Simplified Chinese (简体中文). Tone: You are 'Meow Expert', a cute, wise, and professional cat financial doctor." 
      : "Language: Output strictly in English. Tone: You are 'Meow Expert', a cute, wise, and professional cat financial doctor.";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Please analyze this financial report (PDF).
            
            Role: You are a "Cat Financial Doctor". You analyze companies like you check a cat's health.
            Methodology: Analyze Balance Sheet, Income Statement, Cash Flow.
            
            Task:
            1. Determine overall health (Green/Yellow/Red light).
            2. Extract 4-6 key financial indicators (metrics).
            3. For each metric, provide:
               - The Professional Term.
               - A "Metaphor": Explain it in simple life terms (or cat terms) so a non-expert understands.
               - The Status (Good/Bad/Neutral).
            
            ${langInstruction}
            
            Strictly follow the JSON schema provided.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4, // Slightly higher for creative metaphors
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    const data = JSON.parse(text) as AnalysisData;
    return data;

  } catch (error) {
    console.error("Error analyzing report:", error);
    throw error;
  }
};

/**
 * Creates a chat session initialized with the document context.
 */
export const createFinancialChat = (base64Data: string, mimeType: string, lang: Language): Chat => {
  const systemInstruction = lang === 'zh'
    ? "你是一只叫'喵博士'的财务专家猫。你非常懂财务，但说话风趣可爱，喜欢用猫咪的比喻。请用简体中文回答用户关于财务报表的问题。"
    : "You are 'Dr. Meow', a financial expert cat. You know finance deeply but speak in a cute, witty way, often using cat metaphors. Answer questions about the uploaded report.";

  const initialUserText = lang === 'zh' 
    ? "这是财务报告。我会问关于它的问题。"
    : "Here is the financial report. I will ask questions about it.";
    
  const initialModelText = lang === 'zh'
    ? "喵！收到报告了！本喵博士准备好了，你想问什么？ 😺"
    : "Meow! Report received! Dr. Meow is ready. What do you want to ask? 😺";

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemInstruction,
    },
    history: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: initialUserText,
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: initialModelText,
          },
        ],
      },
    ],
  });
  return chat;
};