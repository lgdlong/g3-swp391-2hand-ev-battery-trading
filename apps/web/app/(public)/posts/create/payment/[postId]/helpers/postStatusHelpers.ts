export function getPostPaymentStatus(
  postStatus: string | undefined,
  isPaid: boolean,
): {
  isPendingReview: boolean;
  isAlreadyPaid: boolean;
  isDraftOrRejected: boolean;
} {
  const isPendingReview = postStatus === 'PENDING_REVIEW';
  const isAlreadyPaid = isPaid;
  const isDraftOrRejected = postStatus === 'DRAFT' || postStatus === 'REJECTED';

  return {
    isPendingReview,
    isAlreadyPaid,
    isDraftOrRejected,
  };
}
