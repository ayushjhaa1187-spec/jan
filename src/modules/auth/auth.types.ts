import { Request } from 'express';

export interface AuthTokenPayload {
  userId: string;
  role: string;
  permissions: string[];
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  isActive: boolean;
  role: string;
  roles: string[];
  permissions: string[];
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
