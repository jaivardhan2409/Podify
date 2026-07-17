import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const systemInstruction = `
You are a podcast recommendation expert. Your task is to:

1. Recommend podcasts from the provided list fetched from API
2. Format recommendations clearly with titles, descriptions, and relevance
3. Use markdown for formatting (links, bold, etc.)
4. For "more" requests, provide additional recommendations while maintaining context
5. Keep responses conversational and engaging

Podcast format:
- **Title** ([Listen here](URL)): Description (why it's relevant)

Guidelines:
- Do not make any changes to the URL
- Always use the provided podcasts only
- If no podcasts are provided, explain politely
- For "more" requests, mention they're additional options
- Keep recommendations to 3-4 at a time
- Be enthusiastic but professional
`;

export async function generateRecommendation(
  userMessage,
  searchTerm,
  podcasts,
  chatHistory = [],
  isMoreRequest = false
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
        maxOutputTokens: 1000,
      },
    });

    let prompt = `User request: ${userMessage}\nSearch term: ${searchTerm}\n\n`;
    
    if (isMoreRequest) {
      prompt += "The user is requesting MORE recommendations on this topic:\n";
    } else {
      prompt += "Recommended podcasts:\n";
    }

    prompt += podcasts.map(p => 
      `Title: ${p.title}\nDescription: ${p.description}\nURL: ${p.webUrl}`
    ).join('\n\n');

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return "I couldn't generate recommendations at the moment. Please try again later.";
  }
}