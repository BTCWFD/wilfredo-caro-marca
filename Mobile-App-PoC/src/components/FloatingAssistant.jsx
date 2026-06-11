import React, { useState } from 'react';
import './FloatingAssistant.css';

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="floating-assistant-container">
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
