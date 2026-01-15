import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

// Components
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import SuggestedQuestions from './components/SuggestedQuestions';

function App() {
  // 1. Initialize State from LocalStorage (or use default)
const [messages, setMessages] = useState(() => {
  const saved = localStorage.getItem('chat_history');
  return saved ? JSON.parse(saved) : [
    { 
      role: 'bot', 
      text: '👋 **Market Intelligence Agent Online.**\n\nI can compare LegalZoom against live competitors, analyze pricing models, and summarize user sentiment from real-time web data.\n\nHow can I help you today?' 
    }
  ];
});

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

const API_URL = '';

  // 2. Save to LocalStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

const handleClear = () => {
  const defaultMsg = [{ 
    role: 'bot', 
    text: '👋 **Market Intelligence Agent Online.**\n\nI can compare LegalZoom against live competitors, analyze pricing models, and summarize user sentiment from real-time web data.\n\nHow can I help you today?' 
  }];
  setMessages(defaultMsg);
  localStorage.setItem('chat_history', JSON.stringify(defaultMsg));
};

  const handleSend = async (text = null) => {
    const userText = text || input;
    if (!userText.trim()) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/ask-competitor`, {
        question: userText
      });

      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: response.data.answer, 
        sources: response.data.sources 
      }]);

    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "⚠️ I lost connection to the brain. Please check your server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Pass handleClear to the Header */}
      <Header onClear={handleClear} />

      <div className="chat-window">
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}
        
        {/* Only show suggestions if it's a fresh chat */}
        {messages.length === 1 && (
            <SuggestedQuestions handleSend={handleSend} />
        )}

       {isLoading && (
  <div className="message bot">
    <div className="typing-indicator">
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
    </div>
  </div>
)}
        <div ref={chatEndRef} />
      </div>

      <InputArea 
        input={input} 
        setInput={setInput} 
        handleSend={() => handleSend()} 
        isLoading={isLoading} 
      />
    </div>
  );
}

export default App;