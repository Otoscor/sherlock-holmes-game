# 백엔드 Dockerfile
FROM node:18-alpine

WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# TypeScript 전역 설치
RUN npm install -g typescript

# 소스 코드 복사
COPY . .

# TypeScript 컴파일
RUN npm run build

# 불필요한 파일 정리
RUN rm -rf src tsconfig.json

EXPOSE 3001

# 프로덕션 모드로 실행
CMD ["node", "dist/index.js"]




