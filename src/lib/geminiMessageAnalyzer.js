import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const systemInstruction = `
You are a message analysis AI that determines:
1. If a message is a greeting/small talk
2. If it's a request for more content ("more such", "other options", "more related", etc.)
3. The appropriate search term for podcast recommendations
4. If the message needs clarification

Respond STRICTLY in this JSON format:
{
  "isGreeting": boolean,
  "isMoreRequest": boolean,
  "searchTerm": string|null,
  "needsClarification": boolean
}

Guidelines:
- Greetings: Any welcoming/small talk messages
- More requests: Explicit or implicit requests for additional content
- Search term: Specific topic derived from the message (null if not applicable) (max 2-3 words only)
- Needs clarification: When the message is unclear or ambiguous
- If the topic is different from the previous one's then return searchTerm instead of isMoreRequest (Important)

Example responses:
{"isGreeting":true,"isMoreRequest":false,"searchTerm":null,"needsClarification":false}
{"isGreeting":false,"isMoreRequest":true,"searchTerm":"mental health","needsClarification":false}
{"isGreeting":false,"isMoreRequest":false,"searchTerm":null,"needsClarification":true}
`;

export async function analyzeMessage(message, lastSearchTerm = null) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      systemInstruction
    });

    const prompt = `Message: ${message}\nLast search term: ${lastSearchTerm || 'none'}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to extract JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error analyzing message:", error);
    return {
      isGreeting: false,
      isMoreRequest: false,
      searchTerm: null,
      needsClarification: true
    };
  }
}