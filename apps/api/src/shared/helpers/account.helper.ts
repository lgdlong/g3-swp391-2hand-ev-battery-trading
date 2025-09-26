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

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation result and message
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message: string;
} {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character (@$!%*?&)',
    };
  }

  return { isValid: true, message: 'Password is strong' };
}

/**
 * Generate a secure random password
 * @param length - Length of the password (default: 12)
 * @returns string - Generated password
 */
export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '@$!%*?&';
  const allChars = lowercase + uppercase + numbers + symbols;

  let password = '';

  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
