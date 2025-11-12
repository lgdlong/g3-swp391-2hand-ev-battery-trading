'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RefundCase } from '@/types/refund';
import { useAdminDecideRefund } from '@/hooks/useRefund';
import { z } from 'zod';

const decideRefundSchema = z.object({
  adminNote: z
    .string()
    .min(10, 'Ghi chú phải có ít nhất 10 ký tự')
    .max(500, 'Ghi chú không được quá 500 ký tự'),
});

type DecideRefundFormData = z.infer<typeof decideRefundSchema>;

const SCENARIO_CONFIG = {
  FRAUD_SUSPECTED: {
    label: 'Nghi ngờ gian lận',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
  },
  FRAUD_CONFIRMED: {
    label: 'Xác nhận gian lận',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    textColor: 'text-red-900',
    icon: XCircle,
    iconColor: 'text-red-700',
  },
  CANCEL_EARLY: {
    label: 'Hủy sớm (< 7 ngày)',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    icon: CheckCircle2,
    iconColor: 'text-blue-600',
  },
  CANCEL_LATE: {
    label: 'Hủy muộn (7-30 ngày)',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
  },
  EXPIRED: {
    label: 'Hết hạn (> 30 ngày)',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-800',
    icon: AlertTriangle,
    iconColor: 'text-gray-600',
  },
} as const;

interface ResolveCaseDialogProps {
  refundCase: RefundCase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResolveCaseDialog({ refundCase, open, onOpenChange }: ResolveCaseDialogProps) {
  const [selectedDecision, setSelectedDecision] = useState<'approve' | 'reject' | null>(null);
  const { mutate: decideRefund, isPending } = useAdminDecideRefund();

  const form = useForm<DecideRefundFormData>({
    resolver: zodResolver(decideRefundSchema),
    defaultValues: {
      adminNote: '',
    },
  });

  const onSubmit = async (data: DecideRefundFormData) => {
    if (!refundCase || !selectedDecision) {
      return;
    }

    decideRefund(
      {
        refundId: refundCase.id,
        payload: {
          decision: selectedDecision,
          adminNote: data.adminNote,
          refundPercentage: undefined,
        },
      },
      {
        onSuccess: () => {
          form.reset();
          setSelectedDecision(null);
          onOpenChange(false);
        },
      },
    );
  };

  const handleDecisionClick = (decision: 'approve' | 'reject') => {
    setSelectedDecision(decision);
  };

  if (!refundCase) {
    return null;
  }

  const scenarioConfig =
    SCENARIO_CONFIG[refundCase.scenario as keyof typeof SCENARIO_CONFIG] || SCENARIO_CONFIG.EXPIRED;
  const ScenarioIcon = scenarioConfig.icon;

  const amountOriginal = Number.parseFloat(refundCase.amountOriginal || '0');
  const amountRefund = Number.parseFloat(refundCase.amountRefund || '0');
  const refundPercent = amountOriginal > 0 ? (amountRefund / amountOriginal) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Xử lý yêu cầu hoàn tiền</DialogTitle>
          <DialogDescription>
            Xem xét và quyết định hoàn tiền cho bài viết #{refundCase.postId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={`p-4 border-2 rounded-lg ${scenarioConfig.bgColor} ${scenarioConfig.borderColor}`}
          >
            <div className="flex items-start gap-3">
              <ScenarioIcon
                className={`h-6 w-6 mt-0.5 flex-shrink-0 ${scenarioConfig.iconColor}`}
              />
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold ${scenarioConfig.textColor}`}>
                  {scenarioConfig.label}
                </h3>
                <p className="text-sm text-gray-600 mt-1 break-words">{refundCase.reason}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Số tiền gốc</p>
              <p className="text-xl font-bold text-gray-900">
                {amountOriginal.toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Số tiền hoàn lại (theo chính sách)</p>
              <p className="text-xl font-bold text-green-700">
                {amountRefund.toLocaleString('vi-VN')} đ
                <span className="text-sm font-normal ml-2">({refundPercent.toFixed(0)}%)</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Quyết định của bạn:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDecisionClick('approve')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedDecision === 'approve'
                    ? 'bg-green-50 border-green-500 ring-2 ring-green-200'
                    : 'bg-white border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2
                    className={`h-5 w-5 ${selectedDecision === 'approve' ? 'text-green-600' : 'text-gray-400'}`}
                  />
                  <span
                    className={`font-semibold ${selectedDecision === 'approve' ? 'text-green-700' : 'text-gray-600'}`}
                  >
                    Hoàn tiền
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Chuyển {amountRefund.toLocaleString('vi-VN')} đ vào ví người dùng
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleDecisionClick('reject')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedDecision === 'reject'
                    ? 'bg-red-50 border-red-500 ring-2 ring-red-200'
                    : 'bg-white border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <XCircle
                    className={`h-5 w-5 ${selectedDecision === 'reject' ? 'text-red-600' : 'text-gray-400'}`}
                  />
                  <span
                    className={`font-semibold ${selectedDecision === 'reject' ? 'text-red-700' : 'text-gray-600'}`}
                  >
                    Giữ phí
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Không hoàn tiền, thu phí {amountOriginal.toLocaleString('vi-VN')} đ
                </p>
              </button>
            </div>
          </div>

          {selectedDecision && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="adminNote"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                        <label className="text-sm font-medium text-gray-700">
                          Ghi chú của Admin <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Nhập lý do quyết định của bạn (tối thiểu 10 ký tự)..."
                          className="min-h-[100px] resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setSelectedDecision(null);
                      onOpenChange(false);
                    }}
                    disabled={isPending}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending || !selectedDecision}
                    className={
                      selectedDecision === 'approve'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }
                  >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {selectedDecision === 'approve' ? 'Xác nhận hoàn tiền' : 'Xác nhận giữ phí'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
