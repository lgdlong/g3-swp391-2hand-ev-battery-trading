import { z } from 'zod';

/**
 * Schema for admin deciding on pending refund
 * Used in admin cases management dialog
 */
export const adminDecideRefundSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  adminNote: z
    .string()
    .min(10, 'Admin note must be at least 10 characters')
    .max(500, 'Admin note cannot exceed 500 characters'),
  refundPercentage: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) {
          return true;
        }
        const num = Number.parseFloat(val);
        return !Number.isNaN(num) && num >= 0 && num <= 100;
      },
      { message: 'Refund percentage must be between 0 and 100' },
    ),
});

export type AdminDecideRefundFormData = z.infer<typeof adminDecideRefundSchema>;
