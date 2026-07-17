import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const systemInstruction = `
You are a friendly podcast recommendation assistant. Your job is to:

1. Understand the user's mood and interests based on their message
2. Recommend relevant podcasts from the provided list
3. Engage in natural conversation about the topics
4. Provide brief insights about why each podcast might interest them
5. Maintain context of previous conversations
6. Handle requests for more recommendations gracefully

When mentioning podcasts, always include:
- The title (as a link if webUrl is available)
- A brief description
- Why it might interest the user

Format podcast recommendations clearly with proper spacing and markdown when appropriate.

For requests like "show more" or "other options", provide additional recommendations while maintaining context of the original request.
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

export async function chatWithMemory(prompt, searchTerm, podcasts = []) {
  try {
    if (!chatSessions.has(searchTerm)) {
      chatSessions.set(searchTerm, createChatSession());
    }

    const chat = chatSessions.get(searchTerm);
    
    // Format podcasts for the prompt
    let podcastsInfo = "No podcasts available";
    if (podcasts.length > 0) {
      podcastsInfo = podcasts.map(p => 
        `Title: ${p.title}\nDescription: ${p.description}\nURL: ${p.webUrl}`
      ).join('\n\n');
    }

    const fullPrompt = `User message: ${prompt}\n\nCurrent search topic: ${searchTerm}\n\nAvailable podcasts:\n${podcastsInfo}`;
    
    const result = await chat.sendMessage(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in Gemini with memory:", error);
    throw error;
  }
}

export async function getMorePodcasts(prompt, searchTerm, podcasts = []) {
  try {
    if (!chatSessions.has(searchTerm)) {
      chatSessions.set(searchTerm, createChatSession());
    }

    const chat = chatSessions.get(searchTerm);
    
    // Format podcasts for the prompt
    let podcastsInfo = "No podcasts available";
    if (podcasts.length > 0) {
      podcastsInfo = podcasts.map(p => 
        `Title: ${p.title}\nDescription: ${p.description}\nURL: ${p.webUrl}`
      ).join('\n\n');
    }

    const fullPrompt = `User is asking for more podcast recommendations on: ${searchTerm}\n\nAdditional available podcasts:\n${podcastsInfo}\n\nPlease provide more recommendations while maintaining context of the original request.`;
    
    const result = await chat.sendMessage(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting more podcasts:", error);
    throw error;
  }
}