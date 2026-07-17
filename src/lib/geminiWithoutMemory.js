const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

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
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    // Clean the response to extract JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error in Groq without memory:", error);
    throw error;
  }
}