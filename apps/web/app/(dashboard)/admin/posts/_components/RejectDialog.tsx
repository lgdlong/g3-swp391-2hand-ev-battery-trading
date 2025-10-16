'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RejectDialogProps {
  onReject: (reason: string) => Promise<void>;
  isRejecting?: boolean;
  triggerVariant?: 'sm' | 'lg';
  triggerClassName?: string;
  children?: React.ReactNode;
}

export function RejectDialog({
  onReject,
  isRejecting = false,
  triggerVariant = 'sm',
  triggerClassName = '',
  children,
}: RejectDialogProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleReject = async () => {
    if (!rejectReason.trim()) return;

    try {
      await onReject(rejectReason);
      setIsDialogOpen(false);
      setRejectReason('');
    } catch (error) {
      console.error('Failed to reject post:', error);
    }
  };

  const defaultTrigger = (
    <Button
      variant="destructive"
      size={triggerVariant}
      className={`bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 ${
        triggerVariant === 'sm' ? 'text-sm font-medium' : 'text-base font-medium px-8'
      } ${triggerClassName}`}
    >
      <div
        className={`${triggerVariant === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} rounded-full bg-red-100 flex items-center justify-center`}
      >
        <X className={`${triggerVariant === 'sm' ? 'w-3 h-3' : 'w-3 h-3'} text-red-600`} />
      </div>
      {isRejecting ? 'Đang từ chối...' : 'Từ chối bài đăng'}
    </Button>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Từ chối bài đăng</DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do từ chối bài đăng này. Lý do sẽ được gửi đến người đăng.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Lý do từ chối</Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Hủy
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={!rejectReason.trim() || isRejecting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isRejecting ? 'Đang từ chối...' : 'Từ chối bài đăng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
