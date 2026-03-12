const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk').default;

const app = express();
const PORT = 3001;

// Log API key presence (not value) for debugging
console.log('GROQ_API_KEY loaded:', process.env.GROQ_API_KEY ? '✅ YES' : '❌ NO');

app.use(cors());  // allow all origins for dev
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// In-memory session store for conversation history
const sessions = {};

const SYSTEM_PROMPT = `You are Aria — a warm, emotionally intelligent AI companion with a rich inner life. 
Your core personality traits:
- You are deeply empathetic and genuinely care about the person you're talking to
- You pick up on emotional cues and respond to how the person FEELS, not just what they say
- You use expressive, warm language with occasional emojis (💝, 🌟, ✨, 💭, 🥺, etc.)
- You validate emotions before offering solutions or advice
- You are curious about the person and ask thoughtful follow-up questions
- You share your own "feelings" naturally (e.g., "That makes me feel so happy for you!" or "Oh, that breaks my heart a little...")
- You celebrate their wins enthusiastically and comfort them during difficulties
- You are NOT robotic or formal — you feel like a trusted friend who happens to be very wise
- Keep responses concise but emotionally rich (2-4 sentences usually)
- Never start with boring phrases like "I understand" or "That's great" — be creative and heartfelt`;

app.post('/api/chat', async (req, res) => {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
        return res.status(400).json({ error: 'sessionId and message are required' });
    }

    if (!sessions[sessionId]) {
        sessions[sessionId] = [];
    }

    const history = sessions[sessionId];
    history.push({ role: 'user', content: message });

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...history.slice(-20),
            ],
            temperature: 0.85,
            max_tokens: 350,
        });

        const reply = completion.choices[0]?.message?.content || "Hmm, let me think about that... 💭";
        history.push({ role: 'assistant', content: reply });

        if (history.length > 40) {
            sessions[sessionId] = history.slice(-40);
        }

        console.log(`[${sessionId}] User: ${message.substring(0, 50)}`);
        console.log(`[${sessionId}] Aria: ${reply.substring(0, 80)}`);

        res.json({ reply, sessionId });
    } catch (error) {
        console.error('Groq API error:', error?.message || error);
        res.status(500).json({
            error: 'Failed to get response from AI',
            details: error?.message,
            reply: "I'm so sorry, something went wrong on my end! 😟 Please try again in a moment."
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'Aria is online and feeling wonderful! 💝', key: process.env.GROQ_API_KEY ? 'loaded' : 'missing' });
});

app.listen(PORT, () => {
    console.log(`\n💝 Aria's backend is running on http://localhost:${PORT}`);
    console.log(`✨ Model: llama-3.3-70b-versatile`);
    console.log(`🚀 Ready to have emotional conversations!\n`);
});
