export interface PostPayment {
  postId: string;
  accountId: number;
  amountPaid: string;
  walletTransactionId: number;
  createdAt: Date;
}

export interface CreatePostPaymentDto {
  postId: string;
  accountId: number;
  amountPaid: string;
  walletTransactionId: number;
}

export interface PostPaymentCheckResponse {
  postId: string;
  isPaid: boolean;
}

export interface PostPaymentListResponse {
  data: PostPayment[];
  total: number;
  page: number;
  limit: number;
}
