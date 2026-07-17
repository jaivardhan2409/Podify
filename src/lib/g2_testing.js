const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

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

// Store chat histories per session
const chatHistories = new Map();

export async function getSearchTerm2(prompt, sessionId = "default2") {
  try {
    if (!chatHistories.has(sessionId)) {
      chatHistories.set(sessionId, []);
    }

    const history = chatHistories.get(sessionId);

    // Build messages array
    const messages = [
      { role: "system", content: systemInstruction },
      ...history,
      { role: "user", content: `User message: ${prompt}` },
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
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    // Store in history for memory
    history.push({ role: "user", content: `User message: ${prompt}` });
    history.push({ role: "assistant", content: text });

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error in Groq with memory:", error);
    throw error;
  }
}