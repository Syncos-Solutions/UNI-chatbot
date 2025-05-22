// src/App.js - Updated for Local Development + Production
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// Loading Dots Component
const LoadingDots = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    color: '#6b7280'
  }}>
    <span style={{ fontSize: '14px' }}>AI is thinking</span>
    <div style={{ display: 'flex', gap: '4px' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#6b7280',
            borderRadius: '50%',
            animation: `bounce 1.4s infinite ease-in-out both`,
            animationDelay: `${i * 0.16}s`
          }}
        />
      ))}
    </div>
  </div>
);

// Chat Message Component
const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const messageStyle = {
    display: 'flex',
    gap: '12px',
    maxWidth: '85%',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    flexDirection: isUser ? 'row-reverse' : 'row',
    marginBottom: '16px',
    animation: 'slideIn 0.3s ease-out'
  };

  const avatarStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
    background: isUser 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white'
  };

  const textStyle = {
    padding: '12px 16px',
    borderRadius: '18px',
    lineHeight: '1.5',
    fontSize: '14px',
    wordWrap: 'break-word',
    background: isUser 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'white',
    color: isUser ? 'white' : '#374151',
    border: isUser ? 'none' : '1px solid #e5e7eb',
    borderBottomLeftRadius: isUser ? '18px' : '4px',
    borderBottomRightRadius: isUser ? '4px' : '18px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  };

  const timeStyle = {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '4px',
    textAlign: isUser ? 'right' : 'left'
  };

  return (
    <div style={messageStyle}>
      <div style={avatarStyle}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div>
        <div style={textStyle}>
          {message.text}
        </div>
        <div style={timeStyle}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

// Message Input Component
const MessageInput = ({ value, onChange, onSend, disabled }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const containerStyle = {
    padding: '16px 20px',
    borderTop: '1px solid #e5e7eb',
    background: 'white'
  };

  const formStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    padding: '8px',
    border: `2px solid ${isFocused ? '#667eea' : '#e5e7eb'}`,
    borderRadius: '24px',
    background: 'white',
    transition: 'border-color 0.2s ease'
  };

  const inputStyle = {
    flex: 1,
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontSize: '14px',
    lineHeight: '1.5',
    padding: '8px 12px',
    minHeight: '20px',
    maxHeight: '100px',
    fontFamily: 'inherit',
    background: 'transparent'
  };

  const buttonStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    background: value.trim() && !disabled 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : '#e5e7eb',
    color: value.trim() && !disabled ? 'white' : '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: value.trim() && !disabled ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s ease',
    transform: value.trim() && !disabled ? 'scale(1)' : 'scale(0.95)'
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask me about university admissions, courses, scholarships..."
          disabled={disabled}
          style={inputStyle}
          rows={1}
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          style={buttonStyle}
          title="Send message"
        >
          ➤
        </button>
      </form>
      <div style={{
        fontSize: '11px',
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: '8px'
      }}>
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};

// Direct API Call Function for Local Development
const callAzureOpenAI = async (message, history = []) => {
  const AZURE_ENDPOINT = 'https://ai-gihanthadeshabia5167ai359740698911.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview';
  const API_KEY = '3Ch25N9NGNiAe3IUw1MAekXSerQO5p8slqHa0AIr4VxRmBzLf5geJQQJ99BEACHYHv6XJ3w3AAAAACOGItYl';

  const systemMessage = {
    role: 'system',
    content: `You are a helpful AI assistant for a university. You specialize in providing information about:

🎓 ACADEMIC INFORMATION:
- Admission requirements and application processes
- Course catalogs, program descriptions, and degree requirements
- Academic policies, grading systems, and graduation requirements
- Class schedules, registration procedures, and enrollment information
- Academic support services and tutoring resources

💰 FINANCIAL INFORMATION:
- Tuition fees and payment plans
- Scholarships, grants, and financial aid opportunities
- Work-study programs and student employment
- Payment deadlines and financial policies

🏛️ CAMPUS LIFE:
- Student services and support resources
- Campus facilities, libraries, and laboratories
- Student organizations and extracurricular activities
- Housing and dining options
- Health and wellness services

📋 ADMINISTRATIVE SUPPORT:
- Registration and enrollment procedures
- Academic calendar and important dates
- Student records and transcript requests
- Contact information for departments and offices
- General university policies and procedures

Always provide accurate, helpful, and friendly responses. If you don't know specific information, direct students to contact the appropriate university department. Keep responses concise but comprehensive, and use a warm, professional tone that reflects the university's commitment to student success.

Use emojis sparingly and appropriately to make responses more engaging. Focus on being genuinely helpful and informative.`
  };

  const messages = [
    systemMessage,
    ...history,
    { role: 'user', content: message }
  ];

  try {
    const response = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      },
      body: JSON.stringify({
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Direct API call error:', error);
    throw error;
  }
};

// Main App Component
function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your University AI Assistant. I can help you with admission requirements, course information, scholarships, registration procedures, and more. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message, conversationHistory = []) => {
    try {
      const recentHistory = conversationHistory
        .slice(-10)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      // Try API route first (for production), fallback to direct call (for local)
      try {
        const response = await axios.post('/api/chat', {
          message: message.trim(),
          history: recentHistory
        }, {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.data && response.data.message) {
          return response.data.message;
        }
      } catch (apiError) {
        console.log('API route not available, using direct call...');
        // Fallback to direct Azure OpenAI call
        return await callAzureOpenAI(message, recentHistory);
      }

    } catch (error) {
      console.error('Send message error:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendMessage(message, messages);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or contact university support for immediate assistance.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What are the admission requirements?",
    "Tell me about scholarships",
    "How do I register for classes?",
    "What programs do you offer?"
  ];

  const appStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    height: '80vh',
    minHeight: '600px',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    color: 'white',
    textAlign: 'center'
  };

  const messagesStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column'
  };

  const quickButtonsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '16px 20px',
    background: '#f8fafc',
    borderTop: '1px solid #e5e7eb'
  };

  const quickButtonStyle = {
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    background: 'white',
    color: '#374151',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
          }
          textarea {
            font-family: inherit;
          }
          @media (max-width: 768px) {
            .app-container {
              margin: 10px;
              height: calc(100vh - 20px);
            }
          }
        `}
      </style>
      
      <div style={appStyle}>
        <div style={containerStyle} className="app-container">
          {/* Header */}
          <div style={headerStyle}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
              🎓 University AI Assistant
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
              Your intelligent guide for university information and support
            </p>
          </div>

          {/* Messages */}
          <div style={messagesStyle}>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>
                <LoadingDots />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && !isLoading && (
            <div style={quickButtonsStyle}>
              <div style={{ width: '100%', marginBottom: '8px', fontSize: '12px', color: '#6b7280' }}>
                Quick Questions:
              </div>
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  style={quickButtonStyle}
                  onClick={() => handleSendMessage(question)}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f3f4f6';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <MessageInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </>
  );
}

export default App;