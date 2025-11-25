import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { ContractStatus } from '@/lib/api/transactionApi';

export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Chưa xác nhận';
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export const getStatusConfig = (status: ContractStatus) => {
  switch (status) {
    case ContractStatus.AWAITING_CONFIRMATION:
      return {
        label: 'Chờ xác nhận',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
      };
    case ContractStatus.SUCCESS:
      return {
        label: 'Thành công',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle2,
      };
    case ContractStatus.FORFEITED_EXTERNAL:
      return {
        label: 'Bán ngoài hệ thống',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: XCircle,
      };
    case ContractStatus.PENDING_REFUND:
      return {
        label: 'Chờ hoàn tiền',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: AlertTriangle,
      };
    default:
      return {
        label: status,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Clock,
      };
  }
};

