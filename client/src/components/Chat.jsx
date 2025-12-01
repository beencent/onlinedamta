import { useState, useEffect, useRef } from 'react';

function Chat({ socket, nickname }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('chat_message', (msg) => {
      setMessages(prev => [...prev, msg].slice(-20)); // Keep last 20
    });

    return () => socket.off('chat_message');
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      socket.emit('chat_message', { nickname, text: input });
      setInput('');
    }
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      right: '20px',
      height: '200px',
      display: 'flex',
      flexDirection: 'column',
      pointerEvents: 'none' // Allow clicking through to background
    }}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: '10px',
        paddingBottom: '10px'
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            alignSelf: msg.nickname === nickname ? 'flex-end' : 'flex-start',
            backgroundColor: msg.isNpc ? '#4a4a4a' : 'rgba(0,0,0,0.6)',
            padding: '8px 12px',
            borderRadius: '12px',
            maxWidth: '70%',
            pointerEvents: 'auto'
          }}>
            <span style={{ fontWeight: 'bold', marginRight: '5px', color: '#aaa' }}>
              {msg.nickname}:
            </span>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ pointerEvents: 'auto', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지 입력..."
          style={{ flex: 1 }}
        />
      </form>
    </div>
  );
}

export default Chat;
