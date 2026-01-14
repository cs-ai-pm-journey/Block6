import { Lightbulb } from 'lucide-react';

const SuggestedQuestions = ({ handleSend }) => {
  const questions = [
    "How much does the LegalZoom LLC Pro package cost?",
    "What is the LegalZoom guarantee?",
    "Summarize the API rate limits.",
    "Does LegalZoom offer a refund?",
  ];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '10px', 
      margin: '20px 40px' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '0.9rem' }}>
        <Lightbulb size={16} />
        <span>Suggested Questions</span>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {questions.map((q, index) => (
          <button
            key={index}
            onClick={() => handleSend(q)}
            style={{
              background: '#2d2d2d',
              border: '1px solid #444',
              borderRadius: '20px',
              padding: '8px 16px',
              color: '#fff',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
                e.target.style.borderColor = '#007bff';
                e.target.style.background = '#333';
            }}
            onMouseLeave={(e) => {
                e.target.style.borderColor = '#444';
                e.target.style.background = '#2d2d2d';
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;