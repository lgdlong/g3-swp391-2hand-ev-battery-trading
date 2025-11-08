'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefundCase } from '@/types/refund';
import { useAdminDecideRefund } from '@/hooks/useRefund';
import {
  adminDecideRefundSchema,
  type AdminDecideRefundFormData,
} from '@/validations/refund.schema';

// Badge color mapping
const SCENARIO_BADGE_CONFIG = {
  FRAUD_SUSPECTED: 'destructive' as const,
  CANCEL_EARLY: 'secondary' as const,
  CANCEL_LATE: 'secondary' as const,
  EXPIRED: 'secondary' as const,
} as const;

interface ResolveCaseDialogProps {
  refundCase: RefundCase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResolveCaseDialog({ refundCase, open, onOpenChange }: ResolveCaseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: decideRefund } = useAdminDecideRefund();

  const form = useForm<AdminDecideRefundFormData>({
    resolver: zodResolver(adminDecideRefundSchema),
    defaultValues: {
      decision: 'approve',
      adminNote: '',
      refundPercentage: '',
    },
  });

  const watchDecision = form.watch('decision');

  const onSubmit = async (data: AdminDecideRefundFormData) => {
    if (!refundCase) {
      return;
    }

    setIsSubmitting(true);

    try {
      const refundPercentage = data.refundPercentage
        ? Number.parseFloat(data.refundPercentage)
        : undefined;

      decideRefund(
        {
          refundId: refundCase.id,
          payload: {
            decision: data.decision,
            adminNote: data.adminNote,
            refundPercentage,
          },
        },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
        },
      );
    } catch {
      setIsSubmitting(false);
    }
  };

  if (!refundCase) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Resolve Refund Case #{refundCase.id}</DialogTitle>
          <DialogDescription>
            Decide whether to approve or reject this pending refund request.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 rounded-lg border border-muted p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">User Email</p>
              <p className="font-medium">{refundCase.account?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount Original</p>
              <p className="font-medium">
                {Number.parseFloat(refundCase.amountOriginal).toLocaleString('vi-VN')} VND
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">Scenario</p>
              <Badge
                variant={
                  SCENARIO_BADGE_CONFIG[
                    refundCase.scenario as keyof typeof SCENARIO_BADGE_CONFIG
                  ] || 'secondary'
                }
              >
                {refundCase.scenario.replace(/_/g, ' ')}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Policy Rate</p>
              <p className="font-medium">{refundCase.policyRatePercent}%</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Suggested Refund Amount</p>
              <p className="text-lg font-bold text-primary">
                {Number.parseFloat(refundCase.amountRefund).toLocaleString('vi-VN')} VND
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="decision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Decision</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select decision" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="approve">Approve (Refund to user)</SelectItem>
                      <SelectItem value="reject">Reject (No refund)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {watchDecision === 'approve'
                      ? 'User will receive the refund amount into their wallet'
                      : 'The refund will be rejected and no money will be returned'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchDecision === 'approve' && (
              <FormField
                control={form.control}
                name="refundPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Custom Refund Percentage{' '}
                      <span className="text-muted-foreground">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={`Default: ${refundCase.policyRatePercent}%`}
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Override the policy rate if needed (0-100). Leave empty to use default{' '}
                      {refundCase.policyRatePercent}%
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="adminNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the reason for your decision..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed explanation for this decision (min 10 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `${watchDecision === 'approve' ? 'Approve' : 'Reject'} Refund`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
