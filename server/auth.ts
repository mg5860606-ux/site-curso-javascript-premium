import crypto from 'crypto';
import { getUserByEmail, upsertUser } from './db';

/**
 * Hash de senha usando PBKDF2 (algoritmo seguro)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verificar se a senha corresponde ao hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split(':');
  const computedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return computedHash === storedHash;
}

/**
 * Gerar senha temporária aleatória para novos alunos
 */
export function generateTemporaryPassword(): string {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Autenticar utilizador com email e senha
 */
export async function authenticateUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  
  if (!user || !user.passwordHash) {
    return null;
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return user;
}

/**
 * Criar novo utilizador (admin)
 */
export async function createUser(email: string, name: string, role: 'user' | 'admin' = 'user') {
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = hashPassword(temporaryPassword);

  await upsertUser({
    email,
    name,
    passwordHash,
    role,
  });

  return {
    email,
    name,
    temporaryPassword,
    role,
  };
}
