const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

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

// Store chat histories per search term
const chatHistories = new Map();

export async function chatWithMemory(prompt, searchTerm, podcasts = []) {
  try {
    if (!chatHistories.has(searchTerm)) {
      chatHistories.set(searchTerm, []);
    }

    const history = chatHistories.get(searchTerm);

    // Format podcasts for the prompt
    let podcastsInfo = "No podcasts available";
    if (podcasts.length > 0) {
      podcastsInfo = podcasts.map(p =>
        `Title: ${p.title}\nDescription: ${p.description}\nURL: ${p.webUrl}`
      ).join('\n\n');
    }

    const fullPrompt = `User message: ${prompt}\n\nCurrent search topic: ${searchTerm}\n\nAvailable podcasts:\n${podcastsInfo}`;

    // Build messages array
    const messages = [
      { role: "system", content: systemInstruction },
      ...history,
      { role: "user", content: fullPrompt },
    ];

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    // Store in history for memory
    history.push({ role: "user", content: fullPrompt });
    history.push({ role: "assistant", content: text });

    return text;
  } catch (error) {
    console.error("Error in Groq with memory:", error);
    throw error;
  }
}

export async function getMorePodcasts(prompt, searchTerm, podcasts = []) {
  try {
    if (!chatHistories.has(searchTerm)) {
      chatHistories.set(searchTerm, []);
    }

    const history = chatHistories.get(searchTerm);

    // Format podcasts for the prompt
    let podcastsInfo = "No podcasts available";
    if (podcasts.length > 0) {
      podcastsInfo = podcasts.map(p =>
        `Title: ${p.title}\nDescription: ${p.description}\nURL: ${p.webUrl}`
      ).join('\n\n');
    }

    const fullPrompt = `User is asking for more podcast recommendations on: ${searchTerm}\n\nAdditional available podcasts:\n${podcastsInfo}\n\nPlease provide more recommendations while maintaining context of the original request.`;

    // Build messages array
    const messages = [
      { role: "system", content: systemInstruction },
      ...history,
      { role: "user", content: fullPrompt },
    ];

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    // Store in history for memory
    history.push({ role: "user", content: fullPrompt });
    history.push({ role: "assistant", content: text });

    return text;
  } catch (error) {
    console.error("Error getting more podcasts:", error);
    throw error;
  }
}