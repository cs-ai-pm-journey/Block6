import { Bot, Trash2 } from 'lucide-react';

const Header = ({ onClear }) => {
  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={24} color="#007bff" />
          <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Competitor Bot v1.0</h1>
        </div>

        {/* Clear Button */}
        <button 
          onClick={onClear}
          title="Clear History"
          style={{
            background: 'transparent',
            border: '1px solid #444',
            color: '#888',
            padding: '8px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ff4444';
            e.currentTarget.style.borderColor = '#ff4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#888';
            e.currentTarget.style.borderColor = '#444';
          }}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default Header;