# 🕵️ Sherlock Holmes Game - 서버 연결 가이드

셜록 홈즈 추리 게임에 서버 연결 기능이 추가되었습니다!

## 🚀 개선사항

### ✅ 완료된 기능

- **AI 서비스 개선**: 환경 변수 기반 API 키 관리
- **에러 핸들링 강화**: 재시도 로직 및 지수 백오프
- **연결 상태 모니터링**: 실시간 서버 연결 상태 표시
- **백엔드 API 서버**: Express.js 기반 REST API
- **Docker 지원**: 컨테이너 기반 배포 설정

### 🔧 현재 서버 연결 상태

- **프론트엔드**: Gemini AI API 직접 연결
- **백엔드**: 선택적 Express.js API 서버
- **모니터링**: 실시간 연결 상태 표시

## 📋 실행 방법

### 1. 개발 모드 (현재 상태)

```bash
# 프론트엔드만 실행
npm run dev
```

### 2. 백엔드 포함 실행

```bash
# 백엔드 서버 설치 및 실행
cd server
npm install
npm run dev

# 새 터미널에서 프론트엔드 실행
cd ..
npm run dev
```

### 3. Docker로 전체 시스템 실행

```bash
# 환경 변수 설정 (필요시)
cp .env.example .env
# .env 파일에서 API 키 설정

# Docker Compose로 실행
docker-compose up --build
```

## 🔑 환경 변수 설정

### 프론트엔드 (.env)

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_AI_MODEL=gemini-1.5-flash
VITE_AI_PROVIDER=gemini
VITE_API_BASE_URL=http://localhost:3001
```

### 백엔드 (server/.env)

```env
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-1.5-flash
AI_PROVIDER=gemini
```

## 🌐 API 엔드포인트

### 백엔드 API

- `GET /api/health` - 서버 상태 확인
- `GET /api/health/detailed` - 상세 서버 상태
- `POST /api/ai/chat` - AI 채팅
- `GET /api/ai/status` - AI 서비스 상태
- `POST /api/ai/test-connection` - AI 연결 테스트

### 사용 예시

```javascript
// AI 채팅
fetch("http://localhost:3001/api/ai/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "안녕하세요",
    storyId: "red-study",
    playerCharacter: "holmes",
  }),
});
```

## 🔍 서버 상태 모니터링

게임 UI 상단에서 실시간 서버 연결 상태를 확인할 수 있습니다:

- 🟢 **서버 연결됨**: AI API가 정상 작동 중
- 🔴 **서버 연결 안됨**: API 연결 실패, 폴백 모드 동작
- 🔄 **연결 확인 중**: 연결 상태 테스트 중

## 🛠️ 기술 스택

### 프론트엔드

- React 18 + TypeScript
- Vite (개발 서버)
- Tailwind CSS
- React Router DOM

### 백엔드

- Node.js + Express
- TypeScript
- CORS, Helmet (보안)
- Rate Limiting

### AI 서비스

- Google Gemini API (기본)
- OpenAI API (선택적)
- Anthropic Claude (선택적)

### 배포

- Docker + Docker Compose
- Nginx (프론트엔드 서빙)
- 환경별 설정 분리

## 🚨 문제 해결

### API 키 오류

1. `.env` 파일에 올바른 API 키 설정
2. 환경 변수 이름 확인 (`VITE_` 접두사 필요)
3. 브라우저 개발자 도구에서 네트워크 탭 확인

### 연결 오류

1. 서버 상태 모니터링 확인
2. 네트워크 연결 상태 확인
3. API 할당량 및 요금 확인
4. 폴백 모드로 게임 계속 가능

### Docker 실행 오류

1. Docker 및 Docker Compose 설치 확인
2. 포트 충돌 확인 (3000, 3001)
3. 환경 변수 설정 확인

## 📈 향후 개선 계획

- [ ] WebSocket 실시간 통신
- [ ] 데이터베이스 연동 (게임 진행 저장)
- [ ] 사용자 인증 시스템
- [ ] 게임 통계 및 분석
- [ ] 다중 사용자 지원

---

**🎮 게임을 즐기세요!** 문제가 발생하면 서버 상태를 확인하고, 필요시 연결 테스트를 실행해보세요.




