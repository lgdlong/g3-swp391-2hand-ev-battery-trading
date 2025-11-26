'use client';

import { Navbar } from '@/components/navbar/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
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
    },
    {
      title: 'Pin EV',
      description: 'Pin xe điện chất lượng cao',
      icon: Battery,
      href: '/posts/batteries',
      color: 'bg-green-50 text-green-600',
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

  const stats = [
    {
      value: '1,800+',
      label: 'Tin đăng',
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      value: '500+',
      label: 'Người dùng',
      icon: Users,
      color: 'text-green-600',
    },
    {
      value: '100%',
      label: 'An toàn',
      icon: Shield,
      color: 'text-purple-600',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Đăng ký tài khoản',
      description: 'Tạo tài khoản miễn phí chỉ trong vài giây',
    },
    {
      step: '02',
      title: 'Đăng tin bán',
      description: 'Đăng tin miễn phí với hình ảnh và mô tả chi tiết',
    },
    {
      step: '03',
      title: 'Kết nối & Giao dịch',
      description: 'Kết nối trực tiếp với người mua, giao dịch an toàn',
    },
  ];

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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Nền Tảng Mua Bán Xe Điện/ Pin Ev Cũ
              </h1>

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
                  Đăng tin ngay
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-gray-600 text-white hover:text-white bg-blue-600 hover:bg-blue-600 cursor-pointer"
                >
                  <Link href="/posts/ev" className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Khám phá ngay
                  </Link>
                </Button>
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
                        <p className="text-gray-600">{category.description}</p>
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

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Cách thức hoạt động</h2>
            <p className="text-gray-600">Chỉ với 3 bước đơn giản</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="text-5xl font-bold text-gray-600 mb-4">{item.step}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-[#048C73] hover:bg-[#037060] text-white">
              <Link href="/posts/ev" className="flex items-center gap-2">
                Khám phá sản phẩm
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Tại sao chọn Nền Tảng Xe Điện Cũ?
            </h2>
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
          {/* Top Section - Nền Tảng Xe Điện Cũ and Categories Side by Side */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-center gap-150 mb-8 px-6">
            {/* About Section */}
            <div className="flex-shrink-0">
              <h3 className="text-xl font-bold mb-4">Nền Tảng Mua Bán Xe Điện Cũ</h3>
              <p className="text-gray-300 mb-4 text-sm leading-relaxed max-w-sm">
                Nền tảng mua bán xe điện và pin EV cũ hàng đầu Việt Nam. An toàn, nhanh chóng, hiệu
                quả.
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
                  <Link
                    href="/posts/batteries"
                    className="hover:text-emerald-400 transition-colors"
                  >
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
              <p className="text-sm text-gray-400">&copy; 2025 Nền Tảng Mua Bán Xe Điện Cũ.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
