import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { sampleEvPosts, formatVnd } from '../sample-ev';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, User, Car, Battery, Gauge, Palette, Hash } from 'lucide-react';
import { Badge } from '@/app/(public)/posts/_components/Badge';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EvDetailPage({ params }: Props) {
  const { id } = await params;
  const post = sampleEvPosts.find((p) => p.id === id);
  if (!post) return notFound();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sold':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'used':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          href="/posts/ev"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 hover:underline"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Section */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="relative h-80 w-full bg-gray-50">
                <Image
                  src={post.thumbnail || '/file-text.svg'}
                  alt={post.title}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-contain p-8"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gray-900 text-white border-0">EV</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className={`border ${getStatusColor(post.status)}`}>
                    {post.status === 'available'
                      ? 'Còn hàng'
                      : post.status === 'reserved'
                        ? 'Giữ chỗ'
                        : 'Đã bán'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatVnd(post.priceVnd)}
                  </div>
                </div>
                <Badge className={`border ${getConditionColor(post.condition)}`}>
                  {post.condition === 'new' ? 'Mới' : 'Đã sử dụng'}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Đăng bởi {post.sellerId}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{post.addressText}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Car className="h-5 w-5" />
                Thông số kỹ thuật
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Năm sản xuất</div>
                    <div className="font-medium">{post.manufactureYear}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Số km</div>
                    <div className="font-medium">{post.odoKm.toLocaleString()} km</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Battery className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Dung lượng pin</div>
                    <div className="font-medium">{post.batteryCapacityKWh} kWh</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Hãng/Model</div>
                    <div className="font-medium">
                      {post.brandName} {post.modelName} {post.trimName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Màu sắc</div>
                    <div className="font-medium">{post.colorName || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Biển số</div>
                    <div className="font-medium">{post.licensePlate || '—'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {post.description && (
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Mô tả chi tiết</h2>
                <p className="text-gray-700 leading-relaxed">{post.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return sampleEvPosts.map((p) => ({ id: p.id }));
}
