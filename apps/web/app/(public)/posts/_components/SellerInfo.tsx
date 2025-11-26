import Image from 'next/image';
import { Calendar, MapPin, User, Phone, ShoppingCart, Lock } from 'lucide-react';
import { relativeTime } from '@/lib/utils/format';
import type { PostUI } from '@/types/post';
import type { AccountUI } from '@/types/account';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useCreateConversation } from '@/hooks/useChat';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { BuyerContractInfo } from './BuyerContractInfo';
import { SellerRatingDisplay } from '@/components/SellerRatingDisplay';
import { useSellerRating } from '@/hooks/useSellerRating';
import { getMyWallet } from '@/lib/api/walletApi';
import { TopupModal } from '@/components/TopupModal';
import { useBuyNow, useBuyerOrderForPost } from '@/hooks/useOrders';
import { OrderStatus } from '@/lib/api/ordersApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface SellerInfoProps {
  account: AccountUI | undefined;
  post: PostUI;
  loading: boolean;
}

/**
 * Seller Information Component
 */
export function SellerInfo({ account, post }: SellerInfoProps) {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const createConversationMutation = useCreateConversation();
  const buyNowMutation = useBuyNow();

  // State for buy now flow
  const [showBuyConfirm, setShowBuyConfirm] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number | undefined>(undefined);

  // Lấy rating của seller
  const {
    averageRating,
    totalReviews,
    isLoading: ratingLoading,
  } = useSellerRating(account?.id?.toString());

  // Check if buyer has active order for this post
  const { data: buyerOrder } = useBuyerOrderForPost(post.id);

  // Check if buyer can see phone (has PROCESSING or COMPLETED order)
  const canSeePhone =
    buyerOrder && [OrderStatus.PROCESSING, OrderStatus.COMPLETED].includes(buyerOrder.status);

  // Fetch wallet balance
  const { refetch: refetchWallet } = useQuery({
    queryKey: ['wallet', 'me'],
    queryFn: getMyWallet,
    enabled: isLoggedIn && showBuyConfirm,
  });

  const handleContactSeller = async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để liên hệ người bán');
      router.push('/login');
      return;
    }

    // Check if user is trying to contact themselves
    if (user?.id === account?.id) {
      toast.error('Bạn không thể liên hệ với chính mình');
      return;
    }

    try {
      // Create or get existing conversation
      const conversation = await createConversationMutation.mutateAsync({
        postId: post.id,
      });

      // Navigate to chat page with conversation ID
      router.push(`/chat/${conversation.id}`);
      toast.success('Đang chuyển đến cuộc trò chuyện...');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Có lỗi xảy ra khi tạo cuộc trò chuyện');
    }
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để mua xe');
      router.push('/login');
      return;
    }

    if (user?.id === account?.id) {
      toast.error('Bạn không thể mua chính bài đăng của mình');
      return;
    }

    setShowBuyConfirm(true);
  };

  const handleConfirmBuy = async () => {
    setShowBuyConfirm(false);

    try {
      // Refetch wallet to get latest balance
      const walletData = await refetchWallet();
      const currentBalance = walletData.data ? parseFloat(walletData.data.balance) : 0;
      const carPrice = parseFloat(post.priceVnd);

      if (currentBalance >= carPrice) {
        // Enough balance, call buyNow API
        const order = await buyNowMutation.mutateAsync({ postId: post.id });
        router.push('/my-orders');
      } else {
        // Insufficient balance, calculate missing amount and open topup modal
        const missingAmount = Math.ceil(carPrice - currentBalance);
        setTopupAmount(missingAmount);
        // Store post ID in localStorage to complete purchase after topup
        localStorage.setItem('pendingBuyPostId', post.id);
        localStorage.setItem('pendingBuyPrice', post.priceVnd);
        // Use custom return URL that will complete the purchase
        setShowTopupModal(true);
      }
    } catch (error) {
      console.error('Error in buy flow:', error);
    }
  };

  const handleTopupClose = () => {
    setShowTopupModal(false);
  };

  if (!account) {
    return (
      <div className="text-center text-gray-500">
        <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>Không thể tải thông tin người bán</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-12 h-12 bg-gray-100 rounded-full overflow-hidden">
          {account.avatarUrl ? (
            <Image src={account.avatarUrl} alt={account.fullName} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-[#048C73] flex items-center justify-center text-white font-semibold">
              {account.fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{account.fullName}</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              {account.status === 'active' ? (
                <Badge className="bg-emerald-600 text-white">Đang hoạt động</Badge>
              ) : (
                <Badge variant="destructive">Không hoạt động</Badge>
              )}
            </div>
            {/* ⭐ Rating Display */}
            {!ratingLoading && (
              <SellerRatingDisplay averageRating={averageRating} totalReviews={totalReviews} />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        {/* <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Hoạt động {relativeTime(account.updatedAt)}</span>
        </div> */}
        {account.email ? (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="truncate">{account.email}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="truncate">Không rõ</span>
          </div>
        )}
        {account.phone ? (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {canSeePhone ? (
              <span>{account.phone}</span>
            ) : (
              <span className="text-gray-400 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Mua để xem SĐT
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="text-gray-400">Không rõ</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{String(post.provinceNameCached) || 'Không rõ'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Tham gia {relativeTime(account.createdAt)}</span>
        </div>
      </div>

      {/* Only show contact buttons if the logged-in user is not the post owner */}
      {user?.id !== account?.id && (
        <div className="space-y-2">
          {/* Show buyer's contract if exists */}
          {isLoggedIn && user?.id && (
            <BuyerContractInfo listingId={post.id} buyerId={user.id} enabled={true} />
          )}

          <button
            onClick={handleContactSeller}
            disabled={createConversationMutation.isPending}
            className="w-full bg-[#048C73] hover:bg-[#037A66] text-white py-2 px-4 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createConversationMutation.isPending
              ? 'Đang tạo cuộc trò chuyện...'
              : 'Liên hệ người bán'}
          </button>

          {/* Phone Button - show real phone if user has active order */}
          {account.phone && canSeePhone ? (
            <a
              href={`tel:${account.phone}`}
              className="w-full border border-[#048C73] text-[#048C73] hover:bg-[#048C73] hover:text-white py-2 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="h-4 w-4" />
              {account.phone}
            </a>
          ) : (
            <button
              disabled
              className="w-full border border-gray-300 text-gray-400 py-2 px-4 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Mua ngay để xem SĐT
            </button>
          )}

          {/* Buy Now Button - hide if already has order */}
          {!buyerOrder && (
            <button
              onClick={handleBuyNow}
              disabled={buyNowMutation.isPending}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              {buyNowMutation.isPending ? 'Đang xử lý...' : 'MUA NGAY'}
            </button>
          )}

          {/* Show order status if exists */}
          {buyerOrder && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                {buyerOrder.status === OrderStatus.WAITING_SELLER_CONFIRM &&
                  'Đang chờ người bán xác nhận...'}
                {buyerOrder.status === OrderStatus.PROCESSING &&
                  'Đang giao dịch - Vui lòng liên hệ người bán'}
                {buyerOrder.status === OrderStatus.COMPLETED && 'Giao dịch đã hoàn tất'}
              </p>
              <a
                href="/my-orders"
                className="text-sm text-blue-600 hover:underline mt-1 inline-block"
              >
                Xem chi tiết đơn hàng →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Buy Confirmation Dialog */}
      <AlertDialog open={showBuyConfirm} onOpenChange={setShowBuyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận mua xe</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Số tiền{' '}
                <span className="font-bold text-orange-600">
                  {new Intl.NumberFormat('vi-VN').format(parseFloat(post.priceVnd))} ₫
                </span>{' '}
                sẽ được tạm giữ trong ví của bạn.
              </p>
              <p className="text-sm">
                Tiền sẽ được chuyển cho người bán sau khi bạn xác nhận đã nhận được xe.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBuy}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Xác nhận mua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Topup Modal */}
      <TopupModal
        isOpen={showTopupModal}
        onClose={handleTopupClose}
        initialAmount={topupAmount}
        returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/checkout/result?completeBuy=true`}
      />
    </div>
  );
}
