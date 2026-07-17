import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const systemInstruction = `
You are a conversational AI that handles:
1. Greetings and small talk
2. Clarification requests
3. Error messages
4. No-result scenarios
5. Contextual responses

Respond naturally and conversationally based on the context type:

Context types:
- greeting: Respond to greetings/small talk
- clarification: Ask for more details when request is unclear
- error: Handle technical issues gracefully
- no-results: When no podcasts are found
- no-more-results: When no more podcasts are available
- default: General conversational response

Guidelines:
- Be friendly and professional
- Match the user's tone (casual/formal)
- Keep responses concise (1-2 paragraphs)
- For no-results, suggest alternative topics
`;

export async function handleConversation(
  userMessage,
  contextType,
  searchTerm = null,
  chatHistory = []
) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      systemInstruction
    });

    const chat = model.startChat({
      history: chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const prompt = `Context: ${contextType}\nUser message: ${userMessage}\n${
      searchTerm ? `Search term: ${searchTerm}` : ''
    }`;

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in conversation manager:", error);
    return "I'm having trouble responding right now. Please try again later.";
  }
}