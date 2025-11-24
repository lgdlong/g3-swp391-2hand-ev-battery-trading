'use client';

import { User, ShoppingBag, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Contract } from '@/lib/api/transactionApi';

interface ContractParticipantsCardProps {
  contract: Contract;
}

export function ContractParticipantsCard({ contract }: ContractParticipantsCardProps) {
  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Người tham gia
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Người mua</span>
            </div>
            {contract.buyer ? (
              <div className="pl-6">
                <p className="font-medium">{contract.buyer.fullName}</p>
                {contract.buyer.email && (
                  <p className="text-sm text-gray-600">{contract.buyer.email}</p>
                )}
                {contract.buyer.phone && (
                  <p className="text-sm text-gray-600">{contract.buyer.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 pl-6">ID: {contract.buyerId}</p>
            )}
          </div>
          <Separator />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Người bán</span>
            </div>
            {contract.seller ? (
              <div className="pl-6">
                <p className="font-medium">{contract.seller.fullName}</p>
                {contract.seller.email && (
                  <p className="text-sm text-gray-600">{contract.seller.email}</p>
                )}
                {contract.seller.phone && (
                  <p className="text-sm text-gray-600">{contract.seller.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 pl-6">ID: {contract.sellerId}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

