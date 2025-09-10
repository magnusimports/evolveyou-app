import React, { useState, useEffect, useRef } from 'react';
import './CoachEVO.css';

const CoachEVO = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Mensagem inicial do EVO
  useEffect(() => {
    const initialMessage = {
      id: 1,
      sender: 'evo',
      message: '👋 Olá! Eu sou o EVO, seu coach virtual! Estou aqui para te ajudar em sua jornada de transformação. Como posso te ajudar hoje?',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    setIsConnected(true);
  }, []);

  // Auto scroll para última mensagem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Chamar API do Coach EVO
      const response = await fetch('/api/evo/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          user_id: 'demo_user', // TODO: Pegar do contexto de autenticação
          context: {
            timestamp: new Date().toISOString(),
            session_id: 'web_session'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erro na comunicação com o EVO');
      }

      const data = await response.json();

      const evoMessage = {
        id: Date.now() + 1,
        sender: 'evo',
        message: data.response,
        timestamp: new Date(data.timestamp)
      };

      setMessages(prev => [...prev, evoMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'evo',
        message: '😅 Ops! Tive um probleminha técnico. Pode tentar novamente? Estou aqui para te ajudar!',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMotivation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/evo/motivation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'demo_user',
          name: 'Usuário',
          goals: ['Perder peso', 'Ganhar massa muscular'],
          preferences: { style: 'motivacional' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const motivationMessage = {
          id: Date.now(),
          sender: 'evo',
          message: `💪 ${data.message}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, motivationMessage]);
      }
    } catch (error) {
      console.error('Erro ao buscar motivação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDailyTip = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/evo/tips');
      
      if (response.ok) {
        const data = await response.json();
        const tipMessage = {
          id: Date.now(),
          sender: 'evo',
          message: `💡 Dica do dia: ${data.tip}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, tipMessage]);
      }
    } catch (error) {
      console.error('Erro ao buscar dica:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="coach-evo-container">
      <div className="coach-header">
        <div className="coach-avatar">
          <div className="avatar-circle">
            <span className="avatar-text">EVO</span>
          </div>
          <div className="status-indicator">
            <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
            <span className="status-text">
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="coach-info">
          <h2>Coach EVO</h2>
          <p>Seu personal trainer virtual</p>
        </div>
        <div className="quick-actions">
          <button 
            className="action-btn motivation-btn"
            onClick={getMotivation}
            disabled={isLoading}
          >
            💪 Motivação
          </button>
          <button 
            className="action-btn tip-btn"
            onClick={getDailyTip}
            disabled={isLoading}
          >
            💡 Dica
          </button>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`message ${msg.sender === 'user' ? 'user-message' : 'evo-message'}`}
            >
              <div className="message-content">
                <p>{msg.message}</p>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message evo-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem para o EVO..."
              className="message-input"
              rows="1"
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage}
              className="send-button"
              disabled={!inputMessage.trim() || isLoading}
            >
              <span className="send-icon">➤</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachEVO;

