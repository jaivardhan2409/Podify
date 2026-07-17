# 🎧 Podify AI - Smart Podcast Recommender

Podify AI is a modern, web-based podcast recommendation platform. It leverages **Groq-powered Llama 3.1** AI to analyze your mood, feelings, or specific interests in a natural chat interface and matches you with high-quality podcasts from the **Podchaser API**.

Featuring a sleek, premium dark-mode interface with voice input, smooth micro-animations, and dynamic search results, Podify AI makes podcast discovery personal, fast, and engaging.

---

## ✨ Key Features

- **💬 Conversational AI**: Speak or type naturally (e.g., *"I'm feeling stressed out, suggest a podcast to relax"* or *"I want to learn about quantum physics"*) and get personalized recommendations.
- **🎙️ Voice Input (Speech-to-Text)**: Click the microphone icon to speak your thoughts instead of typing them.
- **🔍 Real-Time Podcast Matching**: Fetches actual, relevant podcasts from the Podchaser GraphQL database.
- **🌗 Responsive Dark/Light Modes**: Beautiful glassmorphic UI that adapts to user preference.
- **📈 Pagination Support**: Ask for *"more recommendations"* or *"other options"* and get additional matches dynamically.
- **✨ Micro-Animations**: Smooth page transitions and hover effects powered by Framer Motion.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **AI Engine**: [Groq](https://groq.com/) (Llama 3.1 8B Instant)
- **Podcast Database**: [Podchaser GraphQL API](https://www.podchaser.com/developers)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

Follow these steps to set up and run Podify AI locally:

### 1. Clone the Repository
```bash
git clone https://github.com/jaivardhan2409/Podify.git
cd Podify
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a file named `.env` in the root of the project and add your API keys:

```env
# Groq API Key - Get from https://console.groq.com/
VITE_GROQ_API_KEY=your_groq_api_key_here

# Podchaser Developer Token - Get from https://www.podchaser.com/developers/signup
VITE_PODCHASER_API_KEY=your_podchaser_api_key_here
```

> ⚠️ **Important**: The `.env` file is listed in `.gitignore` to prevent secret leakage. Never check these keys into source control.

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to experience Podify AI.

### 5. Build for Production
```bash
npm run build
```

---

## 📂 Project Structure

```
├── public/                # Static assets
├── src/
│   ├── assets/           # Images and media assets
│   ├── lib/              # Integration engines
│   │   ├── geminiConversationManager.js       # Handles general responses (greetings, errors)
│   │   ├── geminiMessageAnalyzer.js           # Extracts topics and intent from chats
│   │   └── geminiRecommendationGenerator.js    # Formats podcast recommendations using Markdown
│   │   └── geminiWithMemory.js                # State-aware recommendations
│   │   └── geminiWithoutMemory.js             # Extraction fallback
│   ├── pages/
│   │   └── LandingPage.jsx                    # Premium landing page
│   ├── App.css
│   ├── App.jsx            # Routing and core application wrap
│   ├── Chat.module.css    # Layout overrides
│   ├── index.css          # Design system & Tailwind setup
│   ├── main.jsx           # React app entry point
│   └── PodcastRecommender.jsx  # Main recommendation interface
├── .env                   # Configuration file (gitignored)
├── package.json           # Scripts and dependencies
└── vite.config.js         # Vite compiler configuration
```

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
