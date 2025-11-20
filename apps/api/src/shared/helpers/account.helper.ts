// apps/api/src/shared/helpers/account.helper.ts
import * as bcrypt from 'bcrypt';
import { DEFAULT_SALT_ROUNDS } from '../constants';

const EMAIL_REGEX = /\S+@\S+\.\S+/;
const NON_DIGIT_REGEX = /\D/g;

export function normalizeEmailOrPhone(value: string): { email?: string; phone?: string } {
  if (EMAIL_REGEX.test(value)) {
    return { email: value.toLowerCase() };
  }
  return { phone: value.replace(NON_DIGIT_REGEX, '') };
}

export function getRandomPassword(): string {
  return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
}

/**
 * Hash a password using bcrypt with configurable salt rounds
 * @param password - Plain text password to hash
 * @param saltRounds - Number of salt rounds (defaults to DEFAULT_SALT_ROUNDS)
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string, saltRounds?: number): Promise<string> {
  const rounds = saltRounds && saltRounds >= 10 ? saltRounds : DEFAULT_SALT_ROUNDS;
  const salt = await bcrypt.genSalt(rounds);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password to compare against
 * @returns Promise<boolean> - True if passwords match
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Hash a password with salt rounds from environment variable
 * @param password - Plain text password to hash
 * @param configSaltRounds - Salt rounds from config (string)
 * @returns Promise<string> - Hashed password
 */
export async function hashPasswordWithConfig(
  password: string,
  configSaltRounds?: string,
): Promise<string> {
  let saltRounds = parseInt(configSaltRounds || DEFAULT_SALT_ROUNDS.toString(), 10);
  if (isNaN(saltRounds) || saltRounds < 10) {
    saltRounds = DEFAULT_SALT_ROUNDS;
  }
  return hashPassword(password, saltRounds);
}
