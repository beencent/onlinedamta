import { useState } from 'react';

function Login({ onLogin }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '20px'
    }}>
      <h1>온라인 담타</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="닉네임을 입력하세요" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <button type="submit">입장하기</button>
      </form>
    </div>
  );
}

export default Login;
