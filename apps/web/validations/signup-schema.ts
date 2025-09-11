import { z } from 'zod';
import { VIETNAMESE_PHONE_REGEX } from '@/utils/regex';

// Các field chung cho cả email / phone
const base = {
  fullName: z.string().min(1, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
};

// Schema cho trường hợp đăng ký bằng email
const emailSchema = z
  .object({
    mode: z.literal('email'), // z.literal: chỉ chấp nhận đúng 'email'
    email: z.string().email('Email is not valid'), // bắt buộc khi mode = email
    phone: z.string().optional(), // optional vì không dùng
    ...base,
  })
  .refine((val) => val.password === val.confirmPassword, {
    // refine: custom rule để check 2 field liên quan nhau
    path: ['confirmPassword'], // báo lỗi ở confirmPassword
    message: 'Confirm password does not match',
  });

// Schema cho trường hợp đăng ký bằng phone
const phoneSchema = z
  .object({
    mode: z.literal('phone'), // literal: chỉ nhận đúng 'phone'
    phone: z.string().regex(VIETNAMESE_PHONE_REGEX, 'VN phone number is not valid'),
    email: z.string().optional(), // optional vì không dùng
    ...base,
  })
  .refine((val) => val.password === val.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

// Gộp 2 schema lại thành discriminatedUnion
// Zod sẽ nhìn vào field 'mode' (discriminator) để biết dùng schema nào
export const signupSchema = z.discriminatedUnion('mode', [emailSchema, phoneSchema]);

// Type cho form input
export type SignupForm = z.input<typeof signupSchema>;
