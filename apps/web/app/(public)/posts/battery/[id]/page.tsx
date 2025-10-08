import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { sampleBatteryPosts, formatVnd } from '../sample-battery';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  MapPin,
  User,
  Battery,
  Zap,
  Activity,
  TrendingUp,
  Star,
  MessageCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/app/(public)/posts/_components/Badge';
import { FilterButtons } from '@/components/breadcrumb-filter';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ brand?: string }>;
};

export default async function BatteryDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { brand } = await searchParams;
  const post = sampleBatteryPosts.find((p) => p.id === id);
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

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (health >= 80) return 'bg-green-50 text-green-700 border-green-200';
    if (health >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (health >= 50) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <>
      <FilterButtons
        type="battery"
        initialCategory="Pin EV"
        initialSubcategory={brand || post.brand || post.title}
        showFilters={false}
      />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link
            href="/posts/battery"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            ← Quay lại danh sách
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Section */}
          <div className="lg:col-span-1 space-y-6">
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
                    <Badge className="bg-gray-900 text-white border-0">BATTERY</Badge>
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
                  {typeof post.healthPercent === 'number' && (
                    <div className="absolute bottom-4 left-4">
                      <Badge className={`border ${getHealthColor(post.healthPercent)}`}>
                        Health: {post.healthPercent}%
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Seller Info Section */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/file-text.svg"
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Ô TÔ LÂM THÀNH</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-yellow-500">4</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">(3 Đánh giá)</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">162 đã bán</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">15 đang bán</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Hoạt động 10 giờ trước</span>
                      </div>
                      <span>Phản hồi: --</span>
                    </div>
                  </div>
                </div>

                {/* Quick Chat Section */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Chat nhanh:
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between group">
                      <span className="text-sm text-gray-700">Xe này còn không a?</span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between group">
                      <span className="text-sm text-gray-700">Giá xe có thể thương lượng</span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    </button>
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
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formatVnd(post.priceVnd)}
                    </div>
                  </div>
                  {post.brand && (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                      {post.brand}
                    </Badge>
                  )}
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
                  <Battery className="h-5 w-5" />
                  Thông số kỹ thuật
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Năm sản xuất</div>
                      <div className="font-medium">{post.year}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Dung lượng</div>
                      <div className="font-medium">{post.batteryCapacityKWh} kWh</div>
                    </div>
                  </div>
                  {post.brand && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Battery className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Hãng pin</div>
                        <div className="font-medium">{post.brand}</div>
                      </div>
                    </div>
                  )}
                  {typeof post.cyclesUsed === 'number' && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Chu kỳ sạc</div>
                        <div className="font-medium">{post.cyclesUsed.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                  {typeof post.healthPercent === 'number' && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Health</div>
                        <div className="font-medium">{post.healthPercent}%</div>
                      </div>
                    </div>
                  )}
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
    </>
  );
}

export async function generateStaticParams() {
  return sampleBatteryPosts.map((p) => ({ id: p.id }));
}
