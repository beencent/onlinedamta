import { useState, useEffect, useRef } from 'react';

function Chat({ socket, nickname }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat_message');
    };
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
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '100%',
      height: '300px', // Reduced height slightly as it's full width now
      display: 'flex',
      flexDirection: 'column',
      // No background color, transparent container
      zIndex: 1000 // Ensure it's on top
    }}>
      <div style={{
        flex: 1,
        overflowY: 'auto', // Keep scrolling
        padding: '10px 20px', // More horizontal padding
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            alignSelf: msg.nickname === nickname ? 'flex-end' : 'flex-start',
            backgroundColor: msg.isNpc ? 'rgba(0,0,0,0.6)' : (msg.nickname === nickname ? '#444' : 'rgba(0,0,0,0.6)'), // Grayscale
            padding: '8px 12px',
            borderRadius: '15px',
            maxWidth: '60%', // Reduced max-width for full screen readability
            fontSize: '0.9rem',
            color: msg.nickname === '찌라시' ? 'rgba(255, 255, 255, 0.8)' : '#fff', // Jjirasi: Softer white
            border: 'none' // No borders
          }}>
            <div style={{ 
              fontSize: '0.7rem', 
              color: msg.nickname === '찌라시' ? '#fffacd' : '#ccc', // Jjirasi: Light yellow name
              marginBottom: '2px' 
            }}>
              {msg.nickname}{msg.department ? ` (${msg.department})` : ''}
            </div>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{
        padding: '10px 20px',
        display: 'flex',
        backgroundColor: 'rgba(0,0,0,0.3)' // Slight background for input area visibility
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지 입력..."
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '4px',
            border: 'none',
            marginRight: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent input
            color: '#fff'
          }}
        />
        <button type="submit" style={{
          padding: '10px 20px',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: '#555', // Grayscale button
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>전송</button>
      </form>
    </div>
  );
}

export default Chat;
