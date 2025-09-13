// validations/login-schema.ts
import { z } from 'zod';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS_REGEX = /^[\d\s\-\+\(\)]+$/;
const MIN_PHONE_DIGITS = 9;

export const loginSchema = z
  .object({
    identifier: z.string().min(1, 'Email hoặc số điện thoại là bắt buộc'),
    password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  })
  .superRefine((data, ctx) => {
    const id = data.identifier.trim();

    const isEmail = EMAIL_REGEX.test(id);
    if (isEmail) return; // hợp lệ là email

    // Không phải email -> kiểm tra phone cơ bản
    if (!PHONE_CHARS_REGEX.test(id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vui lòng nhập email hoặc số điện thoại hợp lệ',
        path: ['identifier'],
      });
      return;
    }

    // chuẩn hoá: giữ lại chữ số để check độ dài
    const digits = id.replace(/\D/g, '');
    if (digits.length < MIN_PHONE_DIGITS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Số điện thoại không hợp lệ',
        path: ['identifier'],
      });
    }
  });

export type LoginForm = z.infer<typeof loginSchema>;
