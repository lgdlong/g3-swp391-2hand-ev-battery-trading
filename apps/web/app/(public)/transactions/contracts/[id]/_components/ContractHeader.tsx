'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStatusConfig } from './utils';
import type { Contract } from '@/lib/api/transactionApi';

interface ContractHeaderProps {
  contract: Contract;
}

export function ContractHeader({ contract }: ContractHeaderProps) {
  const router = useRouter();
  const statusConfig = getStatusConfig(contract.status);
  const StatusIcon = statusConfig.icon;

  return (
    <section className="relative bg-[#1a2332] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#233447] to-[#1a2332] opacity-50"></div>
      <div className="relative container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Chi tiết hợp đồng</h1>
            <p className="text-gray-300">ID: {contract.id}</p>
          </div>
          <Badge className={`${statusConfig.color} border text-sm px-4 py-2`}>
            <StatusIcon className="h-4 w-4 mr-2" />
            {statusConfig.label}
          </Badge>
        </div>
      </div>
    </section>
  );
}

