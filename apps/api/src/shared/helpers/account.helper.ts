// apps/api/src/shared/helpers/account.helper.ts
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
