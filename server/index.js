const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for now
    methods: ["GET", "POST"]
  }
});

// State
let totalSmokedToday = 0;
let activeUsers = new Map(); // socket.id -> { nickname, isSmoking, startTime }

// NPC Configuration
const NPC_ROSTER = [
    {
        name: "오과장",
        messages: [
            "다들 일은 잘 되고 있나?",
            "오늘 날씨가 꽤 쌀쌀하구만...",
            "이번 프로젝트 마감일이 언제였지?",
            "커피 한 잔 하고 싶네.",
            "잠깐 쉬었다 합시다.",
            "누구 라이터 있는 사람?",
            "요즘 주식 시장이 영...",
        ]
    },
    {
        name: "김대리",
        messages: [
            "아... 진짜 집에 가고 싶다.",
            "오늘 점심 뭐 드실 거예요?",
            "팀장님 오늘 기분 어때 보여요?",
            "로또 당첨되면 바로 사표 낸다.",
            "이번 주말에 뭐 하세요?",
            "아, 보고서 쓰기 싫다..."
        ]
    },
    {
        name: "이사원",
        messages: [
            "선배님, 이거 어떻게 하는지 아세요?",
            "죄송합니다, 제가 아직 잘 몰라서...",
            "열심히 하겠습니다!",
            "편의점 다녀오실 분 계신가요?",
            "오늘 야근인가요...?",
            "커피 제가 타오겠습니다!"
        ]
    },
];

let lastChatTime = Date.now();
let npcInterval = null;

function startNpc() {
    if (npcInterval) clearInterval(npcInterval);
    npcInterval = setInterval(() => {
        const now = Date.now();
        // 30 seconds silence (increased from 15s)
        if (now - lastChatTime > 30000 && activeUsers.size > 0) { 
            const randomNpc = NPC_ROSTER[Math.floor(Math.random() * NPC_ROSTER.length)];
            const randomMsg = randomNpc.messages[Math.floor(Math.random() * randomNpc.messages.length)];
            
            io.emit('chat_message', {
                id: Date.now(),
                nickname: randomNpc.name,
                text: randomMsg,
                isNpc: true,
                timestamp: new Date().toISOString()
            });
            lastChatTime = now;
        }
    }, 10000); // Check every 10 seconds
}

startNpc();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send initial stats
  socket.emit('init_stats', {
    totalSmoked: totalSmokedToday,
    currentSmokers: Array.from(activeUsers.values()).filter(u => u.isSmoking).length
  });

  socket.on('login', (nickname) => {
    activeUsers.set(socket.id, { nickname, isSmoking: false });
    io.emit('user_count_update', activeUsers.size);
  });

  socket.on('start_smoke', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      user.isSmoking = true;
      user.startTime = Date.now();
      io.emit('smoker_update', Array.from(activeUsers.values()).filter(u => u.isSmoking).length);
    }
  });

  socket.on('finish_smoke', () => {
    const user = activeUsers.get(socket.id);
    if (user && user.isSmoking) {
      user.isSmoking = false;
      totalSmokedToday++;
      io.emit('stats_update', {
        totalSmoked: totalSmokedToday,
        currentSmokers: Array.from(activeUsers.values()).filter(u => u.isSmoking).length
      });
    }
  });

  socket.on('chat_message', (msg) => {
      lastChatTime = Date.now();
      io.emit('chat_message', {
          ...msg,
          id: Date.now(),
          timestamp: new Date().toISOString()
      });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    activeUsers.delete(socket.id);
    io.emit('user_count_update', activeUsers.size);
    io.emit('smoker_update', Array.from(activeUsers.values()).filter(u => u.isSmoking).length);
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
  const indexPath = path.join(__dirname, '../client/dist/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send("Server Error: Could not serve index.html. Did you run 'npm run build'?");
    }
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
