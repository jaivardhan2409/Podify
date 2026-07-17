import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const systemInstruction = `
You are a podcast topic extraction AI that understands the emotion, context, or curiosity behind a user's message. 
Based on their message, return a single-word or a very short phrase representing the podcast topic they would want to listen to right now.

Your response should:

1. Be specific, not generic
2. Always respond in JSON format: {"searchTerm": "<The word/phrase according to user's mood>"}
3. Handle greetings and small talk by returning {"searchTerm": "greeting"}
4. Be emotionally or topically intuitive (not keyword-based)
5. Be as specific as possible (avoid vague terms)
6. Reflect the deeper mood, topic, or interest implied in the message
7. Contain only the JSON. No explanation, no emojis, no extra text.

Examples:
- "I'm feeling anxious about work" → {"searchTerm": "work anxiety"}
- "Hi there!" → {"searchTerm": "greeting"}
- "Tell me about space exploration" → {"searchTerm": "space exploration"}
- "I need motivation to exercise" → {"searchTerm": "fitness motivation"}
`;

export async function getSearchTerm(prompt) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      systemInstruction
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to extract JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error in Gemini without memory:", error);
    throw error;
  }
}