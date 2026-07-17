const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

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

    // Build the current prompt
    let prompt = `User request: ${userMessage}\nSearch term: ${searchTerm}\n\n`;

    if (isMoreRequest) {
      prompt += "The user is requesting MORE recommendations on this topic:\n";
    } else {
      prompt += "Recommended podcasts:\n";
    }

    prompt += podcasts.map(p =>
      `Title: ${p.title}\nDescription: ${p.description}\nURL: ${p.webUrl}`
    ).join('\n\n');

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
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return "I couldn't generate recommendations at the moment. Please try again later.";
  }
}