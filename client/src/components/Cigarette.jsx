import { useState, useEffect, useRef } from 'react';

function Cigarette({ onFinish }) {
  const [burnProgress, setBurnProgress] = useState(0);
  const [isFastBurn, setIsFastBurn] = useState(false);
  const [ashSize, setAshSize] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const burnRateRef = useRef(0.05); // Normal burn rate
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setBurnProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          onFinish();
          return 100;
        }
        const increment = isFastBurn ? 0.5 : 0.05; // Fast vs Normal
        setAshSize(ash => ash + increment * 0.5);
        return prev + increment;
      });
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [isFastBurn, onFinish]);

  const handleFastBurn = () => {
    setIsFastBurn(true);
    setTimeout(() => setIsFastBurn(false), 2000); // Fast burn for 2 seconds
  };

  const handleAsh = (e) => {
    e.stopPropagation(); // Prevent fast burn trigger if overlapping
    setAshSize(0);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500); // Reset shake after animation
  };

  return (
    <div 
      className={isShaking ? 'shake' : ''}
      style={{ position: 'relative', width: '300px', height: '20px' }}
    >
      {/* Filter */}
      <div 
        onClick={handleFastBurn}
        style={{
          position: 'absolute',
          right: 0,
          width: '80px',
          height: '100%',
          backgroundColor: '#d2691e',
          cursor: 'pointer',
          zIndex: 2
        }}
      />
      
      {/* Cigarette Body (White) */}
      <div style={{
        position: 'absolute',
        right: '80px',
        width: `${220 * (1 - burnProgress / 100)}px`,
        height: '100%',
        backgroundColor: 'white',
        transition: 'width 0.1s linear',
        zIndex: 1
      }} />

      {/* Ash */}
      {ashSize > 0 && (
        <div 
          onClick={handleAsh}
          style={{
            position: 'absolute',
            right: `${80 + 220 * (1 - burnProgress / 100)}px`,
            width: `${Math.min(ashSize * 5, 50)}px`,
            height: '100%',
            backgroundColor: '#888',
            borderRadius: '5px 0 0 5px',
            cursor: 'pointer',
            zIndex: 3, // Higher z-index to be clickable
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Glowing Tip */}
          <div style={{
            position: 'absolute',
            right: 0,
            width: '5px',
            height: '100%',
            backgroundColor: '#ff4500',
            boxShadow: '0 0 10px #ff4500'
          }} />
        </div>
      )}

      {/* Smoke Animation */}
      <div style={{
        position: 'absolute',
        right: `${80 + 220 * (1 - burnProgress / 100)}px`,
        top: '-50px',
        width: '20px',
        height: '50px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
        opacity: isFastBurn ? 0.8 : 0.4,
        transform: `scale(${isFastBurn ? 2 : 1})`,
        transition: 'all 0.3s ease',
        pointerEvents: 'none'
      }} />
    </div>
  );
}

export default Cigarette;
