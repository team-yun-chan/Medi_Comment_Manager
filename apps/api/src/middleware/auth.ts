import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다' });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다' });
  }
};
