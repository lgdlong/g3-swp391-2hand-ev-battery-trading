import { Metadata } from 'next';
import { CasesClient } from './_components/cases-client';

export const metadata: Metadata = {
  title: 'Quản lý hoàn tiền | Bảng điều khiển Admin',
  description: 'Xem và quản lý tất cả hoàn tiền và bài đăng chờ xử lý hoàn tiền',
};

export default function CasesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý hoàn tiền</h1>
        <p className="text-muted-foreground">
          Quản lý hoàn tiền và bài đăng chờ xử lý hoàn tiền
        </p>
      </div>

      <CasesClient />
    </div>
  );
}
