import { Send } from 'lucide-react';

const InputArea = ({ input, setInput, handleSend, isLoading }) => {
  return (
    <div className="input-area">
      <input 
        type="text" 
        placeholder="Ask about pricing, strategy, or API limits..." 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        disabled={isLoading}
      />
      <button onClick={handleSend} disabled={isLoading || !input.trim()}>
        {isLoading ? '...' : <Send size={20} />}
      </button>
    </div>
  );
};

export default InputArea;