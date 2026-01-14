import { useState } from 'react';

const SourceChip = ({ source }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="source-chip-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)} // Handle mobile taps
    >
      <span className="source-chip">
        📄 {source.file}
      </span>

      {/* The Tooltip */}
      {isHovered && (
        <div className="source-tooltip">
          <strong>Excerpt:</strong>
          <p>"{source.text}"</p>
        </div>
      )}
    </div>
  );
};

export default SourceChip;