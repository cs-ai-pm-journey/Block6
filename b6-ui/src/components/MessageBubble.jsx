import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SourceChip from './SourceChip'; // Import the new component

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`message ${message.role}`}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{ marginTop: '4px' }}>
            {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>
        
        <div style={{ flex: 1
         }}>
            {/* Markdown Content */}
            <div className="markdown-content">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({...props}) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" style={{color: '#646cff'}} />
                  )
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
            
            {/* Interactive Source Chips */}
            {message.sources && message.sources.length > 0 && (
              <div className="sources-grid">
                <span style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '4px', display: 'block' }}>
                  Sources used:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {message.sources.slice(0, 3).map((src, i) => (
                    <SourceChip key={i} source={src} />
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;