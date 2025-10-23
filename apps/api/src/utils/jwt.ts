import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthUser } from '../types';

export const generateToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.WEB_JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): AuthUser => {
  try {
    const decoded = jwt.verify(token, config.WEB_JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
