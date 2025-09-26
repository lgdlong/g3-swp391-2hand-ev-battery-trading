'use client';

import { Navbar } from '@/components/navbar';
import { SearchBar } from '@/components/searchbar';
import GeoForm from '@/components/GeoForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar />

      {/* Search bar */}
      <SearchBar />

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Welcome to 2Hand EV Battery Trading
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Your trusted platform for buying and selling high-quality second-hand electric vehicle
            batteries. Find the perfect battery for your EV or sell your used battery to get the
            best value.
          </p>
        </div>

        {/* Admin Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access</h2>
            <p className="text-gray-600 mb-6">
              Truy cập trang quản trị để quản lý tài khoản và hệ thống
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/admin-login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Admin Login
              </a>
              <a
                href="/login"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Normal Login
              </a>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Test credentials: admin@admin.com / 123456</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
