import { z } from 'zod';
import { VIETNAMESE_PHONE_REGEX } from '@/utils/regex';

// Các field chung cho cả email / phone
const base = {
  fullName: z.string().min(1, 'Tên đầy đủ là bắt buộc'),
  password: z.string().min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
  confirmPassword: z.string(),
};

const emailSchema = z
  .object({
    mode: z.literal('email'),
    email: z.email('Email không hợp lệ'),
    phone: z.string().optional(),
    ...base,
  })
  .refine((val) => val.password === val.confirmPassword, {
    // refine: custom rule để check 2 field liên quan nhau
    path: ['confirmPassword'], // báo lỗi ở confirmPassword
    message: 'Mật khẩu xác nhận không khớp',
  });

const phoneSchema = z
  .object({
    mode: z.literal('phone'),
    phone: z.string().regex(VIETNAMESE_PHONE_REGEX, 'Số điện thoại Việt Nam không hợp lệ'),
    email: z.string().optional(),
    ...base,
  })
  .refine((val) => val.password === val.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp',
  });

// Gộp 2 schema lại thành discriminatedUnion
// Zod sẽ nhìn vào field 'mode' (discriminator) để biết dùng schema nào
export const signupSchema = z.discriminatedUnion('mode', [emailSchema, phoneSchema]);

// Type cho form input
export type SignupForm = z.input<typeof signupSchema>;
