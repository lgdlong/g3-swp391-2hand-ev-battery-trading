import Image from 'next/image';
import { Calendar, MapPin, User, MessageCircle, Phone } from 'lucide-react';
import { relativeTime } from '@/lib/utils/format';
import type { PostUI } from '@/types/post';
import type { AccountUI } from '@/types/account';
import { Badge } from '@/components/ui/badge';

interface SellerInfoProps {
  account: AccountUI | undefined;
  post: PostUI;
  loading: boolean;
}

/**
 * Seller Information Component
 */
export function SellerInfo({ account, post }: SellerInfoProps) {
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
        <div>
          <h3 className="font-semibold text-gray-900">{account.fullName}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            {account.status === 'active' ? (
              <Badge className="bg-emerald-600 text-white">Đang hoạt động</Badge>
            ) : (
              <Badge variant="destructive">Không hoạt động</Badge>
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
            <span>{account.phone}</span>
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

      <div className="space-y-2">
        <button className="w-full bg-[#048C73] hover:bg-[#037A66] text-white py-2 px-4 rounded-lg font-bold transition-colors">
          Liên hệ người bán
        </button>
        {account.phone ? (
          <button className="w-full border border-[#048C73] text-[#048C73] hover:bg-[#048C73] hover:text-white py-2 px-4 rounded-lg font-bold transition-colors">
            {account.phone}
          </button>
        ) : (
          <button
            disabled
            className="w-full border border-gray-300 text-gray-400 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
          >
            Không có số điện thoại
          </button>
        )}
      </div>
    </div>
  );
}
