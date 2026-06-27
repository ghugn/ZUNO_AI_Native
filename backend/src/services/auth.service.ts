import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const SECRET = () => process.env.JWT_SECRET || 'fallback-secret';
const SIGN_OPTIONS: SignOptions = { expiresIn: 604800 }; // 7 days in seconds

export async function register(email: string, password: string, fullName: string) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error('Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, fullName },
  });

  const token = jwt.sign({ userId: user.id }, SECRET(), SIGN_OPTIONS);
  return { user: { id: user.id, email: user.email, fullName: user.fullName }, token };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign({ userId: user.id }, SECRET(), SIGN_OPTIONS);
  return { user: { id: user.id, email: user.email, fullName: user.fullName }, token };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) throw new Error('User not found');

  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
