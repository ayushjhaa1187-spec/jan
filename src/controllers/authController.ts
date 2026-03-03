import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { registerSchema, loginSchema } from '../utils/validation';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

export const register = async (req: Request, res: Response) => {
    console.log(`[Auth] Registration attempt for email: ${req.body?.email}`);
    try {
        const validatedData = registerSchema.parse(req.body);
        const { email, password, name, role } = validatedData;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('[Auth] Password hashed successfully');

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role || 'PARTICIPANT',
                profile: {
                    create: {
                        name,
                    },
                },
            },
            include: {
                profile: true,
            }
        });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log(`[Auth] User registered successfully: ${user.id}`);
        res.status(201).json({ user: { id: user.id, email: user.email, role: user.role, name: user.profile?.name }, token });
    } catch (error: any) {
        console.error(`[Auth] Registration error: ${error.name} - ${error.message}`);
        if (error.name === 'ZodError') {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    console.log(`[Auth] Login attempt for email: ${req.body?.email}`);
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log(`[Auth] Login successful: ${user.id}`);
        res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.profile?.name } });
    } catch (error: any) {
        console.error(`[Auth] Login error: ${error.name} - ${error.message}`);
        if (error.name === 'ZodError') {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, role: true, profile: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
