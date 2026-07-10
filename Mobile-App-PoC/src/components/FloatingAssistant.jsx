import { useState, useEffect, useRef } from 'react';
import './FloatingAssistant.css';

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (!isOpen || !window.visualViewport) return;

    let vvRaf = 0;
    const syncKeyboardOffset = () => {
      cancelAnimationFrame(vvRaf);
      vvRaf = requestAnimationFrame(() => {
        const vv = window.visualViewport;
        const overlap = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
        if (containerRef.current) {
          containerRef.current.style.setProperty('--kb-offset', `${overlap}px`);
          containerRef.current.style.setProperty('--vv-height', `${vv.height}px`);
        }
      });
    };

    window.visualViewport.addEventListener('resize', syncKeyboardOffset);
    window.visualViewport.addEventListener('scroll', syncKeyboardOffset);

    // Initial call
    syncKeyboardOffset();

    return () => {
      window.visualViewport.removeEventListener('resize', syncKeyboardOffset);
      window.visualViewport.removeEventListener('scroll', syncKeyboardOffset);
      cancelAnimationFrame(vvRaf);
    };
  }, [isOpen]);

  return (
    <div className={`floating-assistant-container ${isOpen ? 'chat-open' : ''}`} ref={containerRef}>
      {isOpen && (
        <div className="chat-window glass-card">
          <div className="chat-header">
            <h3>AI Assistant</h3>
            <button onClick={toggleChat} className="close-btn">&times;</button>
          </div>
          <div className="chat-body">
            <div className="message bot-message glass-card">
              Hello! How can I help you today?
            </div>
            {/* Simulated empty space for chat */}
          </div>
          <div className="chat-input-area">
            <input type="text" placeholder="Type a message..." className="chat-input glass-card" />
            <button className="send-btn glass-card">Send</button>
          </div>
        </div>
      )}
      
      <button 
        className={`fab glass-card ${isOpen ? 'active' : ''}`} 
        onClick={toggleChat}
        aria-label="Toggle Assistant"
      >
        <span className="icon">✨</span>
      </button>
    </div>
  );
};

export default FloatingAssistant;
