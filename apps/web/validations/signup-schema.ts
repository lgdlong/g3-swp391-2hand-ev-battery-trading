import * as z from 'zod';
import { vietnamesePhoneRegex } from '@/utils/regex';

export const signupSchema = z
  .object({
    email: z
      .string()
      .optional()
      .refine((val) => !val || z.string().email().safeParse(val).success, {
        message: 'Email must be a valid email address',
      }),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || vietnamesePhoneRegex.test(val), {
        message: 'Phone number must be valid',
      }),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters long'),
    fullName: z.string().min(1, 'Full name is required'),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone must be provided',
    path: ['email'], // Show error on email field
  });

export type SignupForm = z.infer<typeof signupSchema>;
