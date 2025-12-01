import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import Login from './components/Login'
import SmokingRoom from './components/SmokingRoom'

// Connect to the same origin in production, or localhost:3002 in dev if needed
// But since we are proxying in dev, we can just use relative path or window.location.origin
const socket = io(import.meta.env.PROD ? undefined : 'http://localhost:3002');

function App() {
  const [nickname, setNickname] = useState(null);
  const [stats, setStats] = useState({ totalSmoked: 0, currentSmokers: 0, totalVisitors: 0 });
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    socket.on('init_stats', (data) => setStats(data));
    socket.on('stats_update', (data) => setStats(data));
    socket.on('smoker_update', (count) => setStats(prev => ({ ...prev, currentSmokers: count })));
    socket.on('user_count_update', (count) => setUserCount(count));
    socket.on('visitor_update', (count) => setStats(prev => ({ ...prev, totalVisitors: count })));

    return () => {
      socket.off('init_stats');
      socket.off('stats_update');
      socket.off('smoker_update');
      socket.off('user_count_update');
      socket.off('visitor_update');
    };
  }, []);

  const handleLogin = (data) => {
    // data is { nickname, department }
    setNickname(data.nickname);
    socket.emit('login', data);
  };

  return (
    <div className="app-container">
      {!nickname ? (
        <Login onLogin={handleLogin} />
      ) : (
        <SmokingRoom 
          socket={socket} 
          nickname={nickname} 
          stats={stats}
          userCount={userCount}
        />
      )}
    </div>
  )
}

export default App
