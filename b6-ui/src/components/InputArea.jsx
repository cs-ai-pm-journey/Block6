import React, { useRef, useEffect } from 'react';

function InputArea({ input, setInput, handleSend, isLoading }) {
  const textareaRef = useRef(null);

  // Auto-resize logic
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to calculate correct scrollHeight (shrink if deleted)
      textareaRef.current.style.height = 'auto';
      // Set to scrollHeight to expand
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-area">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isLoading ? "Thinking..." : "Ask about a competitor..."}
        disabled={isLoading}
        rows={1}
      />
      <button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
        Send
      </button>
    </div>
  );
}

export default InputArea;