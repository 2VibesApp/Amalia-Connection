
import { GoogleGenAI, Type } from "@google/genai";
import { AnswerPair, Question } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getInstantFeedback = async (
  question: string,
  userAnswer: string,
  amaliaAnswer: string
): Promise<string> => {
  const prompt = `
    You are a romantic and witty connection coach. 
    Analyze these two answers to the question: "${question}"
    
    Mattia says: "${userAnswer}"
    Amalia says: "${amaliaAnswer}"
    
    Provide a very short (max 2 sentences), charming, and insightful comment in English about Mattia and Amalia's connection. 
    Focus on how they match, how their differences complement each other, or why their vibe is special. 
    Use their names occasionally to make it feel personal.
    Be warm, sophisticated, and encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text?.trim() || "A perfect match in spirit!";
  } catch (error) {
    console.error("Instant Feedback Error:", error);
    return "Your souls speak the same language, even when the stars are silent.";
  }
};

export const getCompatibilityAnalysis = async (
  answers: AnswerPair[],
  questions: Question[]
): Promise<string> => {
  const formattedData = answers.map(a => {
    const q = questions.find(qu => qu.id === a.questionId);
    return `Question: ${q?.text}\nMattia's Answer: ${a.userAnswer}\nAmalia's Answer: ${a.amaliaAnswer}`;
  }).join('\n\n');

  const prompt = `
    You are a professional relationship counselor and compatibility expert. 
    Below are 20 questions answered by two people: "Mattia" and "Amalia".
    Based on their answers, provide a deep, romantic, and insightful analysis of their compatibility.
    Highlight where they align perfectly and where their differences create a beautiful balance.
    Keep the tone warm, encouraging, and sophisticated.
    
    Data:
    ${formattedData}
    
    Format the output in professional Markdown. Use sections like "Shared Resonance", "The Dance of Differences", and "A Vision for the Future".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Failed to generate analysis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The stars are currently aligning... but our AI analysis hit a temporary snag. You two look great together regardless!";
  }
};
