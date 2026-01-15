import React from 'react';

function SuggestedQuestions({ handleSend }) {
  const questions = [
    "Compare LegalZoom and ZenBusiness LLC prices",
    "Analyze Trustpilot sentiment for Bizee",
    "What is the LegalZoom Satisfaction Guarantee?"
  ];

  return (
    <div className="suggestions">
      <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '5px' }}>
        Try a query:
      </span>
      {questions.map((q, index) => (
        <button 
          key={index} 
          className="suggestion-btn" 
          onClick={() => handleSend(q)}
        >
          {q}
        </button>
      ))}
    </div>
  );
}

export default SuggestedQuestions;