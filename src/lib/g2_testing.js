import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const systemInstruction = `
You are a podcast recommender AI that understands the emotion, context, or curiosity behind a user's message. 
Based on their message, return a single-word or a very short phrase representing the podcast topic they would want to listen to right now.

Your response should:

Be specific, not generic.

Always respond in JSON format {"searchTerm": "<The word/phrase according to user's mood>"}

**Do not limit yourself to a fixed list. You are free to generate new, relevant, natural-sounding topics if needed.**

Be emotionally or topically intuitive (not keyword-based).

Be as specific as possible. Avoid vague terms like "Heartbreak" if "Toxic Relationship" or "Ghosting" fits better.

Reflect the deeper mood, topic, or interest implied in the message.

Contain only the topic. No explanation, no emojis, no extra text.

You can use chat history to remember the user's previous messages and you can suggest a keyword accordingly.
`;

function createChatSession() {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3.5-flash",
    systemInstruction
  });

  return model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });
}

const chatSessions = new Map();

export async function getSearchTerm2(prompt, sessionId = "default2") {
  try {
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, createChatSession());
    }

    const chat = chatSessions.get(sessionId);

    const fullPrompt = `User message: ${prompt}`;
    
    const result = await chat.sendMessage(fullPrompt);
    const response = await result.response;

    const text = response.text();

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);
    
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error in Gemini with memory:", error);
    throw error;
  }
}