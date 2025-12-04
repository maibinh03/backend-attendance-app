// utils/hashPassword.ts
import crypto from 'crypto';

const SECRET = process.env.HASH_SECRET || 'default-secret-key';

export const hashPassword = (password: string): string => {
  return crypto.createHmac('sha256', SECRET).update(password).digest('hex');
};

export const comparePassword = (password: string, hashedPassword: string): boolean => {
  const hashed = hashPassword(password);
  return hashed === hashedPassword;
};

