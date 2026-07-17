const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

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
    // Build messages array with chat history
    const messages = [
      { role: "system", content: systemInstruction },
    ];

    // Add chat history
    for (const msg of chatHistory) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      });
    }

    const prompt = `Context: ${contextType}\nUser message: ${userMessage}\n${
      searchTerm ? `Search term: ${searchTerm}` : ''
    }`;

    messages.push({ role: "user", content: prompt });

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in conversation manager:", error);
    return "I'm having trouble responding right now. Please try again later.";
  }
}