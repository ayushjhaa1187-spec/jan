import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

export const register = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, password: hashed } });
  const token = jwt.sign({ id: user.id, email: user.email, role: 'User' }, JWT_SECRET, { expiresIn: '1d' });

  return res.status(201).json({ user: { id: user.id, email: user.email }, token });
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: 'User' }, JWT_SECRET, { expiresIn: '1d' });
  return res.json({ token, user: { id: user.id, email: user.email } });
};

export const getMe = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, isActive: true } });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(user);
};
