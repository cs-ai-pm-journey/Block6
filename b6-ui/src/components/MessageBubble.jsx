import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function MessageBubble({ message }) {
  const isBot = message.role === 'bot';

  return (
    <div className={`message ${message.role}`}>
      {/* 1. Main Text Content */}
      <div className="markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.text}
        </ReactMarkdown>
      </div>

      {/* 2. Source Chips (Only show if sources exist) */}
      {isBot && message.sources && message.sources.length > 0 && (
        <div className="sources-section">
          <div className="sources-title">Sources Analyzed</div>
          <div className="chips-container">
            {message.sources.map((src, idx) => (
              <span key={idx} className="source-chip" title={src.text}>
                📄 {src.file === "Live Web Intelligence" ? "Web Search" : "Internal Doc"}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageBubble;