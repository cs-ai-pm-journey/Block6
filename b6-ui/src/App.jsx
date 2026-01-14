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
      { role: 'bot', text: 'Hello! I am your Competitor Intelligence Agent. Ask me about LegalZoom pricing, strategy, or API limits.' }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // 2. Save to LocalStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClear = () => {
    const defaultMsg = [{ role: 'bot', text: 'Hello! I am your Competitor Intelligence Agent. Ask me about LegalZoom pricing, strategy, or API limits.' }];
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
             <em>Thinking...</em>
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