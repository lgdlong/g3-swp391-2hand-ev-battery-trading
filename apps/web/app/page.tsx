'use client';

import { Navbar } from '@/components/navbar/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Car,
  Battery,
  Zap,
  Shield,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { getCarPostsWithQuery, getBikePostsWithQuery } from '@/lib/api/postApi';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_IMAGE } from '@/constants/images';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  // Handle create post button click
  const handleCreatePostClick = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    router.push('/posts/create');
  };

  const categories = [
    {
      title: 'Xe điện',
      description: 'Mua bán xe điện, xe máy điện',
      icon: Car,
      href: '/posts/ev',
      color: 'bg-blue-50 text-blue-600',
      count: '1,234 tin đăng',
    },
    {
      title: 'Pin EV',
      description: 'Pin xe điện chất lượng cao',
      icon: Battery,
      href: '/posts/battery',
      color: 'bg-green-50 text-green-600',
      count: '567 tin đăng',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'An toàn & Tin cậy',
      description: 'Tất cả sản phẩm được kiểm tra chất lượng',
    },
    {
      icon: Zap,
      title: 'Giao dịch nhanh',
      description: 'Kết nối trực tiếp người mua và người bán',
    },
    {
      icon: Users,
      title: 'Cộng đồng lớn',
      description: 'Hàng nghìn người dùng tin tưởng',
    },
  ];

  // Fetch featured car posts
  const { data: carPosts = [] } = useQuery({
    queryKey: ['featuredCarPosts'],
    queryFn: () =>
      getCarPostsWithQuery({
        limit: 3,
        offset: 0,
        status: 'PUBLISHED',
        order: 'DESC',
        sort: 'createdAt',
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch featured bike posts
  const { data: bikePosts = [] } = useQuery({
    queryKey: ['featuredBikePosts'],
    queryFn: () =>
      getBikePostsWithQuery({
        limit: 3,
        offset: 0,
        status: 'PUBLISHED',
        order: 'DESC',
        sort: 'createdAt',
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Combine all featured posts
  const allFeaturedPosts = [...carPosts, ...bikePosts];

  const formatVnd = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  // Helper function to safely display flexible field values
  const displayValue = (value: string | number | object | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return 'N/A';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">EV Trading</h1>
              <h2 className="text-xl md:text-2xl text-gray-300 mb-4">
                Chợ Mua Bán Xe Điện Và Pin Cũ EV Hàng Đầu Việt Nam
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                Nền tảng uy tín kết nối người mua với người bán xe điện và pin EV cũ. Giao dịch an
                toàn, nhanh chóng, hiệu quả.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button
                  onClick={handleCreatePostClick}
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-50 hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <TrendingUp className="h-5 w-5" />
                  Đăng tin miễn phí
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-gray-600 text-white hover:bg-amber-800 bg-amber-700"
                >
                  <Link href="/posts/ev" className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Khám phá ngay
                  </Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>1,800+ tin đăng</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>500+ người dùng</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-full flex items-center justify-center">
                  <div className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center">
                        <Battery className="h-10 w-10 text-gray-900" />
                      </div>
                      <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Car className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Danh mục sản phẩm</h2>
            <p className="text-gray-600">Khám phá các loại sản phẩm xe điện và pin EV</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {categories.map((category) => (
              <Link key={category.href} href={category.href}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        <category.icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-gray-600 mb-2">{category.description}</p>
                        <p className="text-sm text-gray-500">{category.count}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sản phẩm mới nhất</h2>
            <p className="text-gray-600">Những tin đăng được cập nhật gần đây</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allFeaturedPosts.map((post) => {
              const isCarPost = !!post.carDetails;
              const location =
                [
                  displayValue(post.provinceNameCached),
                  displayValue(post.districtNameCached),
                  displayValue(post.wardNameCached),
                ]
                  .filter((val) => val !== 'N/A')
                  .join(', ') ||
                displayValue(post.addressTextCached) ||
                'Không rõ';

              const getStatusText = (status: string) => {
                switch (status) {
                  case 'PUBLISHED':
                    return 'Đã duyệt';
                  case 'PENDING_REVIEW':
                    return 'Chờ duyệt';
                  case 'DRAFT':
                    return 'Nháp';
                  case 'REJECTED':
                    return 'Từ chối';
                  case 'PAUSED':
                    return 'Tạm dừng';
                  case 'SOLD':
                    return 'Đã bán';
                  case 'ARCHIVED':
                    return 'Lưu trữ';
                  default:
                    return status;
                }
              };

              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'PUBLISHED':
                    return 'bg-green-100 text-green-800';
                  case 'PENDING_REVIEW':
                    return 'bg-yellow-100 text-yellow-800';
                  case 'DRAFT':
                    return 'bg-gray-100 text-gray-800';
                  case 'REJECTED':
                    return 'bg-red-100 text-red-800';
                  case 'PAUSED':
                    return 'bg-blue-100 text-blue-800';
                  case 'SOLD':
                    return 'bg-purple-100 text-purple-800';
                  case 'ARCHIVED':
                    return 'bg-gray-100 text-gray-600';
                  default:
                    return 'bg-gray-100 text-gray-800';
                }
              };

              return (
                <Link key={post.id} href={`/posts/ev/${post.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm">
                    <CardContent className="p-0">
                      <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                        <Image
                          src={
                            // support legacy types where images may be array of strings
                            (Array.isArray(post.images) &&
                            typeof (post.images as any)[0] === 'object'
                              ? (post.images as any)[0]?.url
                              : undefined) || DEFAULT_IMAGE
                          }
                          alt={post.title}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`${isCarPost ? 'bg-[#048C73]' : 'bg-[#2563EB]'} text-white px-2 py-1 rounded text-xs font-medium`}
                          >
                            {isCarPost ? 'Ô tô điện' : 'Xe máy điện'}
                          </span>
                        </div>
                        {/* Status badge removed */}
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#048C73] transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{location}</p>

                        {/* Vehicle specs */}
                        <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500">
                          {(post.carDetails || post.bikeDetails) && (
                            <>
                              <span className="bg-gray-100 px-2 py-1 rounded">
                                {displayValue(
                                  post.carDetails?.manufacture_year ||
                                    post.bikeDetails?.manufacture_year,
                                )}
                              </span>
                              <span className="bg-gray-100 px-2 py-1 rounded">
                                {displayValue(post.carDetails?.odo_km || post.bikeDetails?.odo_km)}{' '}
                                km
                              </span>
                              <span className="bg-gray-100 px-2 py-1 rounded">
                                {displayValue(
                                  post.carDetails?.battery_capacity_kwh ||
                                    post.bikeDetails?.battery_capacity_kwh,
                                )}{' '}
                                kWh
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-[#048C73]">
                            {formatVnd(post.priceVnd)}
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#048C73] transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="text-center mt-8">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Link href="/posts/ev">
                Xem tất cả sản phẩm
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Tại sao chọn EV Trading?</h2>
            <p className="text-gray-600">Nền tảng uy tín cho cộng đồng xe điện Việt Nam</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          {/* Top Section - EV Trading and Categories Side by Side */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-center gap-150 mb-8 px-6">
            {/* About Section */}
            <div className="flex-shrink-0">
              <h3 className="text-xl font-bold mb-4">EV Trading</h3>
              <p className="text-gray-300 mb-4 text-sm leading-relaxed max-w-sm">
                Nền tảng mua bán xe điện và pin EV cũ hàng đầu Việt Nam. An toàn, nhanh chóng, hiệu quả.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="h-4 w-4" />
                <span>Hàng nghìn giao dịch thành công</span>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Danh mục</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="/posts/ev" className="hover:text-emerald-400 transition-colors">
                    Xe điện
                  </Link>
                </li>
                <li>
                  <Link href="/posts/batteries" className="hover:text-emerald-400 transition-colors">
                    Pin EV
                  </Link>
                </li>
                <li>
                  <Link href="/posts/create" className="hover:text-emerald-400 transition-colors">
                    Đăng tin
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-sm text-gray-400">
                &copy; 2025 EV Trading Platform.
              </p>
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-400">Theo dõi chúng tôi:</p>
                <div className="flex gap-3">
                  <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.39v-1.2h-2.84v8.37h2.84v-4.13c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.13h2.84M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.87.39-1.8.65-2.77.77 1-1 1.77-2.6 2.14-4.5-1 .6-2.1 1-3.27 1.3-.94-1-2.28-1.6-3.76-1.6-2.85 0-5.15 2.3-5.15 5.15 0 .4.05.8.15 1.18-4.28-.2-8.08-2.27-10.62-5.4-.44.77-.7 1.67-.7 2.62 0 1.79.91 3.37 2.29 4.3-.84-.03-1.64-.26-2.34-.65v.06c0 2.5 1.78 4.58 4.14 5.05-.44.12-.9.18-1.37.18-.34 0-.67-.03-1-.1.67 2.1 2.62 3.63 4.92 3.67-1.76 1.38-4 2.2-6.42 2.2-.42 0-.83-.02-1.23-.07 2.29 1.47 5.02 2.32 7.94 2.32 9.53 0 14.73-7.9 14.73-14.73 0-.22 0-.45-.02-.67.88-.64 1.64-1.44 2.24-2.36"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
