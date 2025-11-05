import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { displayValue, formatVnd } from './utils';
import type { Post } from '@/types/api/post';
import { HeartCallApi } from './HeartCallApi';
import { DEFAULT_IMAGE } from '@/constants/images';
import { VerificationBadge } from '@/components/VerificationBadge';

interface PostCardProps {
  item: Post;
  onTitleClick?: (title: string) => void;
}

export function PostCard({ item, onTitleClick }: PostCardProps) {
  const location =
    [
      // displayValue(item.wardNameCached),
      displayValue(item.districtNameCached),
    ]
      .filter((val) => val !== 'N/A')
      .join(', ') ||
    displayValue(item.addressTextCached) ||
    'Không rõ';

  return (
    <Link
      key={item.id}
      href={`/posts/ev/${item.id}?title=${encodeURIComponent(item.title)}`}
      className="group"
    >
      <Card className="overflow-hidden border-0 hover:shadow-md transition-all duration-300 bg-white p-0">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative h-48 w-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
            <Image
              src={
                (typeof item.images?.[0] === 'object' && item.images?.[0] && 'url' in item.images[0]
                  ? (item.images[0] as { url: string }).url
                  : undefined) || DEFAULT_IMAGE
              }
              alt={item.title}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className="object-contain group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              <Badge
                className={`${item.carDetails ? 'bg-[#048C73]' : 'bg-[#2563EB]'} text-white border-0`}
              >
                {item.carDetails ? 'Ô tô điện' : 'Xe máy điện'}
              </Badge>
            </div>
            {/* Verification badge - góc trên bên phải */}
            {item.verificationRequest?.status === 'APPROVED' && (
              <VerificationBadge className="absolute top-3 right-3" />
            )}
            {/* Status badge removed */}
            {(item.carDetails?.origin === 'NOI_DIA' || item.bikeDetails?.origin === 'NOI_DIA') && (
              <div className="absolute right-4 bottom-4">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Nội địa</Badge>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3
                  className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-[#048C73] transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    onTitleClick?.(item.title);
                  }}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {displayValue(
                    item.carDetails?.manufacture_year || item.bikeDetails?.manufacture_year,
                  )}
                </p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {!location ? 'Không rõ' : location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {displayValue(
                  item.carDetails?.battery_capacity_kwh || item.bikeDetails?.battery_capacity_kwh,
                )}{' '}
                kWh
              </div>
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {typeof (item.carDetails?.odo_km || item.bikeDetails?.odo_km) === 'number'
                  ? (item.carDetails?.odo_km || item.bikeDetails?.odo_km)?.toLocaleString()
                  : displayValue(item.carDetails?.odo_km || item.bikeDetails?.odo_km) === 'N/A'
                    ? '~'
                    : displayValue(item.carDetails?.odo_km || item.bikeDetails?.odo_km)}{' '}
                km
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-red-600">{formatVnd(item.priceVnd)}</div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  className="h-5 w-5 text-[#048C73]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>

            {/* Bookmark button */}
            <div className="mt-4 flex justify-end" onClick={(e) => e.preventDefault()}>
              <HeartCallApi postId={Number(item.id)} initialBookmark={null} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
