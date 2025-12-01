import { useState } from 'react';

const DEPARTMENTS = ["디경", "무선", "브이디", "넷사", "의료기기", "가전"];

function Login({ onLogin }) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin({ nickname: name, department });
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
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={department} 
            onChange={(e) => setDepartment(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: '#1e1e1e',
              color: '#e0e0e0',
              border: '1px solid #333'
            }}
          >
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="닉네임을 입력하세요" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <button type="submit" style={{ width: '100%' }}>입장하기</button>
      </form>
    </div>
  );
}

export default Login;
