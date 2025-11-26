'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getContract, ContractStatus } from '@/lib/api/transactionApi';
import { ContractConfirmationDialog } from './_components/ContractConfirmationDialog';
import { OrderInformation } from './_components/OrderInformation';
import { ContractHeader } from './_components/ContractHeader';
import { ContractActionsCard } from './_components/ContractActionsCard';
import { ContractStatusCard } from './_components/ContractStatusCard';
import { ContractParticipantsCard } from './_components/ContractParticipantsCard';
import { ContractErrorState } from './_components/ContractErrorState';
import { ContractLoadingState } from './_components/ContractLoadingState';
import { formatDate } from './_components/utils';
import { useAuth } from '@/lib/auth-context';
import { getPostById } from '@/lib/api/postApi';
import { adaptPostDto } from '@/lib/adapters/post';

export default function ContractDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const contractId = params?.id as string;
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const {
    data: contract,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => getContract(contractId),
    enabled: !!contractId,
  });

  // Fetch post details
  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', contract?.listingId],
    queryFn: () => getPostById(contract!.listingId),
    select: adaptPostDto,
    enabled: !!contract?.listingId,
  });

  if (isLoading) {
    return <ContractLoadingState />;
  }

  if (error || !contract) {
    return <ContractErrorState error={error} />;
  }

  const isBuyer = user?.id === contract.buyerId;
  const isSeller = user?.id === contract.sellerId;

  // Buyer needs to confirm receipt after seller confirms order
  const canConfirmBuyer =
    isBuyer &&
    !contract.buyerConfirmedAt &&
    contract.status === ContractStatus.AWAITING_CONFIRMATION;
  const canConfirmSeller = isSeller && !contract.sellerConfirmedAt;

  return (
    <div className="min-h-screen bg-gray-50">
      <ContractHeader contract={contract} />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Action Cards */}
          <div className="lg:col-span-1 space-y-6">
            <ContractActionsCard
              isBuyer={isBuyer}
              canConfirmBuyer={canConfirmBuyer}
              canConfirmSeller={canConfirmSeller}
              onConfirmClick={() => setIsConfirmDialogOpen(true)}
              contractStatus={contract.status}
              postId={contract.listingId}
            />

            <ContractStatusCard contract={contract} />

            <ContractParticipantsCard contract={contract} />
          </div>

          {/* Right Column - Order Information */}
          <div className="lg:col-span-2 space-y-6">
            <OrderInformation
              post={post}
              isLoadingPost={isLoadingPost}
              contract={contract}
              formatDate={formatDate}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {user && (
        <ContractConfirmationDialog
          contract={contract}
          currentUserId={user.id}
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onSuccess={() => {
            // Contract will be refetched automatically via query invalidation
          }}
        />
      )}
    </div>
  );
}
