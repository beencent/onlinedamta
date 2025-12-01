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
let totalVisitors = 0; // New: Total visitors count
let activeUsers = new Map(); // socket.id -> { nickname, department, isSmoking, startTime }

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
            "아, 어제 회식 너무 달렸나 봐.",
            "이번 주말엔 등산이나 갈까 하는데.",
            "자네, 요즘 얼굴이 좋아 보이네?",
            "김대리, 그 보고서 다 됐나?",
            "아이고 허리야...",
            "담배 끊어야 하는데 쉽지가 않네.",
            "점심에 국밥 어때?",
            "요즘 애들은 참 빨라.",
            "나 때는 말이야...",
            "이번 달 실적 걱정이네.",
            "주말에 골프 약속이 있어서.",
            "아, 와이프한테 전화해야 하는데.",
            "벌써 시간이 이렇게 됐나?"
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
            "아, 보고서 쓰기 싫다...",
            "오늘따라 시간이 너무 안 가네요.",
            "저기... 혹시 담배 한 대 더 피우실 분?",
            "아까 회의 때 분위기 살벌하더라고요.",
            "월급날은 언제 오려나...",
            "어제 넷플릭스 보느라 늦게 잤어요.",
            "아, 다이어트 해야 하는데.",
            "오늘 저녁에 약속 있으세요?",
            "저 이번 휴가 때 여행 가려고요.",
            "아, 엑셀 자꾸 에러 나네.",
            "커피만 세 잔째예요.",
            "퇴근하고 맥주 한 잔?",
            "아, 진짜 스트레스 받는다.",
            "저 먼저 들어가 보겠습니다.",
            "내일 연차 쓸까 고민 중이에요."
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
            "커피 제가 타오겠습니다!",
            "선배님, 식사는 하셨습니까?",
            "아, 제가 실수한 건 아니겠죠?",
            "이번 주말에 공부 좀 해야겠어요.",
            "저... 질문 하나만 드려도 될까요?",
            "아, 긴장되네요.",
            "오늘 점심 메뉴 추천해 주세요!",
            "선배님 멋지십니다!",
            "저도 얼른 배우고 싶습니다.",
            "아, 복사기 토너가 떨어졌어요.",
            "회의 자료 준비 다 했습니다.",
            "죄송합니다, 다시 하겠습니다.",
            "오늘 회식 있나요?",
            "아, 넥타이가 좀 불편하네요.",
            "선배님, 담배 한 대 피우시죠!"
        ]
    },
    {
        name: "최선임",
        messages: [
            "야, 이거 누가 이렇게 했어?",
            "아, 진짜 답답하네.",
            "내가 몇 번을 말했냐?",
            "오늘까지 다 끝내라.",
            "담배 맛 좋다.",
            "너네 요즘 너무 풀린 거 아니냐?",
            "아, 머리 아파.",
            "이번 프로젝트 엎어지면 다 죽는 거야.",
            "야, 김대리! 잠깐 나 좀 봐.",
            "아, 진짜 피곤하다.",
            "오늘 술 한잔해야겠는데.",
            "야, 웃음이 나오냐?",
            "제대로 좀 하자, 응?",
            "아, 거래처 전화 안 받네.",
            "이번 주말엔 푹 쉬어야지.",
            "야, 담배 있냐?",
            "아, 속 쓰려.",
            "너네 점심 뭐 먹을 거냐?",
            "아, 진짜 짜증 나네.",
            "빨리빨리 좀 해라."
        ]
    },
    {
        name: "정대리",
        messages: [
            "아, 과장님 또 시작이시네.",
            "저 오늘 칼퇴 할 겁니다.",
            "아, 진짜 일하기 싫다.",
            "오늘 점심은 맛있는 거 먹죠.",
            "아, 어제 소개팅 망했어요.",
            "이번 주말에 캠핑 가려고요.",
            "아, 폰 바꿀 때 됐는데.",
            "저기, 라이터 좀 빌려주세요.",
            "아, 졸려 죽겠네.",
            "오늘따라 날씨 좋네요.",
            "아, 월요병 도지네.",
            "저 이번에 주식 좀 땄습니다.",
            "아, 배고파.",
            "오늘 회식은 패스하겠습니다.",
            "아, 진짜 덥다.",
            "저기, 저 먼저 올라가 볼게요.",
            "아, 진짜 이해가 안 가네.",
            "오늘따라 담배가 쓰네.",
            "아, 진짜 집에 가고 싶다.",
            "저 이번에 차 바꿨어요."
        ]
    },
    {
        name: "송주임",
        messages: [
            "저... 이거 맞나요?",
            "아, 감사합니다!",
            "오늘 날씨 진짜 좋네요!",
            "저도 같이 가도 될까요?",
            "아, 진짜요? 대박!",
            "오늘 점심 뭐 드세요?",
            "저 이번에 강아지 입양했어요.",
            "아, 너무 웃겨요 ㅋㅋㅋ",
            "저기... 혹시 시간 되세요?",
            "아, 진짜 힘들다 ㅠㅠ",
            "오늘 칼퇴 도전합니다!",
            "저 이번에 여행 계획 짰어요.",
            "아, 진짜 배고프다.",
            "오늘 커피 제가 쏠게요!",
            "저기, 저 좀 도와주실 수 있나요?",
            "아, 진짜 멘붕이네요.",
            "오늘따라 일이 손에 안 잡히네요.",
            "저 이번에 운동 시작했어요.",
            "아, 진짜 피곤해요.",
            "오늘 하루도 화이팅!"
        ]
    },
    {
        name: "사장님",
        messages: [
            "허허, 다들 고생이 많네.",
            "우리 회사의 미래는 자네들에게 달렸어.",
            "이번 분기 실적 기대하겠네.",
            "건강이 최고야, 건강 챙기게.",
            "자네, 이름이 뭐였더라?",
            "요즘 젊은 친구들은 참 똑똑해.",
            "나 때는 말이야, 밤새서 일했어.",
            "허허, 담배는 적당히 피우게.",
            "우리 회사 주식이 좀 올랐나?",
            "자네들만 믿네.",
            "오늘 점심은 내가 사지.",
            "허허, 날씨가 참 좋구만.",
            "우리 회사 복지 어떤가?",
            "자네, 결혼은 했나?",
            "허허, 웃으면서 일하게.",
            "이번 프로젝트 성공하면 보너스 주지.",
            "자네, 골프 치나?",
            "허허, 다들 열심히 하는구만.",
            "우리 회사가 최고야, 암.",
            "자네들 덕분에 내가 발 뻗고 자네."
        ]
    },
    {
        name: "찌라시",
        messages: [
            "브이디랑 가전 합친대… 팀명 후보가 ‘브가디전’이라서 다들 회의 끝났대.",
            "이번 구조조정 PPT 첫 장이 ‘일단 죄송합니다’였대.",
            "가전 조직도 새 버전에서 직원 수가 1 늘어나 있길래 찾아봤더니 팀장이 실수로 두 번 적었대.",
            "무선·브이디·가전 묶을 새 조직명 공모했는데 1등이 ‘DX로또’였대.",
            "DX 구조조정안 파일 제목이 ‘진짜최종_진짜진짜최종.pptx’라던데.",
            "가전팀에서 구조조정 듣고 ‘그럼 냉장고도 휴면 모드 들어가나요?’ 물어봤대.",
            "브이디 조직도 선이 너무 꼬여서 팀원이 ‘이거 코딩한 사람 있나요?’라고 했다더라.",
            "무선이 디경 부분 흡수한다던데 디경 팀장이 ‘그럼 저희도 폰 지급 받나요?’ 했대.",
            "DX 통합안에서 디경이 ‘기타2’로 들어가 있어서 팀장이 무릎 꿇고 웃었다더라.",
            "인사팀에서 실수로 전사 메일에 '구조조정_최종.xlsx' 첨부했다가 3초 만에 회수했대.",
            "이번 성과급 0%라는 소문이 돌던데, 사실 마이너스라는 썰도 있어.",
            "사장님이 엘리베이터에서 한숨 쉬는 거 봤다는 목격담이 3건이나 올라왔어.",
            "브이디랑 가전 통합 발표 PPT 첫 장이 ‘왜냐면요…’로 시작했다더라.",
            "무선이랑 디경 합친다더라. 이유는 ‘같이 하면 왠지 있어 보여서’래.",
            "가전 재편안 슬라이드에 냉장고 사진만 있고 설명이 없었대.",
            "브이디·가전 통합안에서 두 부서가 서로에게 책임 미루다가 회의 끝났대.",
            "무선이 디경 흡수한다는 말 나오자, 디경 팀이 ‘그럼 우리도 무선 충전 되나요?’라고.",
            "가전 재편표에 직원 이름 옆에 ‘?’ 붙어 있어서 본인이 제일 놀랐다더라.",
            "재편안 설명하려다 PPT가 튕겨서 그냥 말로 설명했대."
        ]
    }
];

let lastChatTime = Date.now();
let npcInterval = null;

function startNpc() {
    if (npcInterval) clearInterval(npcInterval);
    npcInterval = setInterval(() => {
        const now = Date.now();
        // 30 seconds silence check
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
  totalVisitors++; // Increment visitor count

  // Send initial stats
  socket.emit('init_stats', {
    totalSmoked: totalSmokedToday,
    currentSmokers: Array.from(activeUsers.values()).filter(u => u.isSmoking).length,
    totalVisitors: totalVisitors // Send total visitors
  });
  
  // Broadcast updated visitor count to everyone
  io.emit('visitor_update', totalVisitors);

  socket.on('login', (data) => {
    // data can be just nickname (string) or object { nickname, department }
    // Handle backward compatibility if needed, but we expect object now
    const nickname = typeof data === 'string' ? data : data.nickname;
    const department = typeof data === 'object' ? data.department : '';

    activeUsers.set(socket.id, { nickname, department, isSmoking: false });
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
        currentSmokers: Array.from(activeUsers.values()).filter(u => u.isSmoking).length,
        totalVisitors: totalVisitors
      });
    }
  });

  socket.on('chat_message', (msg) => {
      const user = activeUsers.get(socket.id);
      const department = user ? user.department : '';
      lastChatTime = Date.now();
      io.emit('chat_message', {
          ...msg,
          department,
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
