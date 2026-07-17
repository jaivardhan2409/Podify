const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

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
    const prompt = `Message: ${message}\nLast search term: ${lastSearchTerm || 'none'}`;

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
        max_tokens: 500,
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
    console.error("Error analyzing message:", error);
    return {
      isGreeting: false,
      isMoreRequest: false,
      searchTerm: null,
      needsClarification: true
    };
  }
}