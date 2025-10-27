import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Account } from '@/types/account';
import { AccountStatus as StatusEnum } from '@/types/enums/account-enum';

interface AccountDetailsDialogProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDetailsDialog({ account, open, onOpenChange }: AccountDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chi tiết tài khoản</DialogTitle>
          <DialogDescription>Thông tin chi tiết của tài khoản</DialogDescription>
        </DialogHeader>
        {account && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tên</label>
                <p className="text-sm font-medium">{account.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm">{account.email || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">SĐT</label>
                <p className="text-sm">{account.phone || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Vai trò</label>
                <p className="text-sm">{account.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <div className="mt-1">
                  {account.status === StatusEnum.ACTIVE ? (
                    <Badge className="bg-emerald-100 text-emerald-800">Hoạt động</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Bị cấm</Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                <p className="text-sm">{new Date(account.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
