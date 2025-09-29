import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 기본값 설정
  let { statusCode = 500, message } = error

  // 개발 환경에서는 전체 에러 스택 표시
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 서버 에러:', error)
  }

  // 운영 환경에서는 민감한 정보 숨기기
  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    message = '서버 내부 오류가 발생했습니다.'
  }

  // 특정 에러 타입별 처리
  if (error.name === 'ValidationError') {
    statusCode = 400
    message = '입력 데이터가 올바르지 않습니다.'
  } else if (error.name === 'CastError') {
    statusCode = 400
    message = '잘못된 데이터 형식입니다.'
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = '유효하지 않은 토큰입니다.'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = '토큰이 만료되었습니다.'
  }

  // 에러 응답 전송
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  })
}

