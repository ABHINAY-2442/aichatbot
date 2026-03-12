import { useState, useRef, useEffect } from 'react';
import './index.css';

const MOOD_EMOJIS = {
  happy: '😊',
  excited: '🤩',
  thinking: '🤔',
  caring: '🥰',
  sad: '😢',
  surprised: '😲',
  neutral: '😌',
};

const detectMood = (text) => {
  const t = text.toLowerCase();
  if (/thank|love|great|awesome|amazing|wonderful|happy|glad/.test(t)) return 'happy';
  if (/wow|incredible|unbelievable|fantastic|brilliant/.test(t)) return 'excited';
  if (/sorry|sad|bad|terrible|awful|hurt|pain|cry/.test(t)) return 'sad';
  if (/really\?|seriously\?|what\?|how\?|why\?/.test(t)) return 'surprised';
  if (/think|consider|maybe|perhaps|wonder/.test(t)) return 'thinking';
  if (/help|support|need|please|can you/.test(t)) return 'caring';
  return 'neutral';
};

const TYPING_PHRASES = [
  'Feeling your vibe... ✨',
  'Thinking with my heart... 💭',
  'Processing emotions... 🌊',
  'Almost there... 💫',
];

function TypingIndicator() {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % TYPING_PHRASES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="message-wrapper bot">
      <div className="avatar bot-avatar pulse">💝</div>
      <div className="message-content typing-bubble">
        <span className="typing-phrase">{TYPING_PHRASES[phraseIdx]}</span>
        <div className="dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'BOT',
      content: "Hey there! 💖 I'm Aria — your emotionally intelligent AI companion. I'm here to listen, understand, and help you through anything. What's on your mind today?",
      id: 'initial-1',
      mood: 'caring',
    }
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [botMood, setBotMood] = useState('caring');
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMood = detectMood(text);
    const userMsg = { role: 'USER', content: text, id: Date.now(), mood: userMood };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text }),
      });

      if (!response.ok) throw new Error('Server error');

      const data = await response.json();
      const replyMood = detectMood(data.reply);
      setBotMood(replyMood);

      const botMsg = {
        role: 'BOT',
        content: data.reply,
        id: Date.now() + 1,
        mood: replyMood,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'SYSTEM',
        content: "Oh no 😟 I lost connection for a moment. Please try again!",
        id: Date.now() + 2,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app-container">
      <div className="bg-orb orb1" />
      <div className="bg-orb orb2" />
      <div className="bg-orb orb3" />

      <header className="hero-section">
        <div className="hero-badge">Powered by Groq ⚡</div>
        <h1 className="hero-title">
          Emotionally Intelligent<br />
          <span className="gradient-text">AI Companion</span>
        </h1>
        <p className="hero-subtitle">
          Meet Aria — an AI that doesn't just answer,<br />it genuinely <em>understands</em> you.
        </p>
        <div className="feature-pills">
          <span>💝 Empathetic</span>
          <span>⚡ Ultra-Fast</span>
          <span>🧠 Context-Aware</span>
          <span>🌐 24/7 Available</span>
        </div>
      </header>

      {/* Launch button */}
      <button
        className={`chat-toggle-btn ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
      >
        <span className="toggle-icon">{MOOD_EMOJIS[botMood]}</span>
        <span>Chat with Aria</span>
        <span className="live-badge">LIVE</span>
      </button>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            <div className="bot-avatar-header">{MOOD_EMOJIS[botMood]}</div>
            <div className="header-text">
              <h3>Aria</h3>
              <span className="status-line">
                <span className="status-dot" />
                {isTyping ? 'expressing herself...' : 'Online & feeling great!'}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat">✕</button>
        </div>

        {/* Body */}
        <div className="chat-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.role.toLowerCase()}`}>
              {msg.role === 'BOT' && (
                <div className="avatar bot-avatar">{MOOD_EMOJIS[msg.mood] || '💝'}</div>
              )}
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="chat-footer">
          <input
            ref={inputRef}
            type="text"
            placeholder="Share what's on your mind... 💭"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            aria-label="Type your message"
          />
          <button
            className={`send-btn ${isTyping ? 'loading' : ''}`}
            onClick={handleSend}
            disabled={isTyping}
            aria-label="Send message"
          >
            {isTyping ? '⏳' : '💌'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
