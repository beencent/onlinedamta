import { useState, useEffect } from 'react';
import Cigarette from './Cigarette';
import Chat from './Chat';

function SmokingRoom({ socket, nickname, stats, userCount }) {
  const [isSmoking, setIsSmoking] = useState(false);

  useEffect(() => {
    // Listen for updates if needed
  }, [socket]);

  const startSmoking = () => {
    setIsSmoking(true);
    socket.emit('start_smoke');
  };

  const finishSmoking = () => {
    setIsSmoking(false);
    socket.emit('finish_smoke');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div>
          <h2>온라인 담타</h2>
          <p>오늘 태운 담배: {stats.totalSmoked}개비</p>
          <p>현재 흡연자: {stats.currentSmokers}명</p>
          <p>접속자: {userCount}명</p>
        </div>
        <div>
          <p>환영합니다, {nickname}님</p>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        {isSmoking ? (
          <Cigarette onFinish={finishSmoking} />
        ) : (
          <button onClick={startSmoking} style={{ fontSize: '1.2rem', padding: '15px 30px' }}>
            불 붙이기
          </button>
        )}
      </div>

      <Chat socket={socket} nickname={nickname} />
    </div>
  );
}

export default SmokingRoom;
