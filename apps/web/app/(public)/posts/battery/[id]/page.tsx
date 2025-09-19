import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { sampleBatteryPosts, formatVnd } from '../sample-battery';
import { Card, CardContent } from '@/components/ui/card';
// Badge component inline to avoid import issues
const Badge = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className || ''}`}
    {...props}
  >
    {children}
  </div>
);
import { Calendar, MapPin, User, Battery, Zap, Activity, TrendingUp } from 'lucide-react';

type Params = { params: { id: string } };

export default function BatteryDetailPage({ params }: Params) {
  const post = sampleBatteryPosts.find((p) => p.id === params.id);
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
    if (health >= 80) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (health >= 70) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          href="/posts/battery"
          className="inline-flex items-center text-sm text-blue-600 hover:underline"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Section */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="relative h-80 w-full bg-gradient-to-br from-slate-50 to-slate-100">
                <Image
                  src={post.thumbnail || '/file-text.svg'}
                  alt={post.title}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-contain p-8"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                    BATTERY
                  </Badge>
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
                {post.brand && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">{post.brand}</Badge>
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
  );
}

export async function generateStaticParams() {
  return sampleBatteryPosts.map((p) => ({ id: p.id }));
}
