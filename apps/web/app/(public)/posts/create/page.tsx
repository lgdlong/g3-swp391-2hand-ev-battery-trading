'use client';
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Car,
  Battery,
  Upload,
  MapPin,
  DollarSign,
  FileText,
  Calendar,
  Gauge,
  Zap,
  Palette,
  Hash,
  Activity,
  TrendingUp,
} from 'lucide-react';

// Badge component inline
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

type PostType = 'ev' | 'battery';

export default function CreatePostPage() {
  const [postType, setPostType] = useState<PostType>('ev');
  const [formData, setFormData] = useState({
    // Common fields
    title: '',
    description: '',
    priceVnd: '',
    addressText: '',

    // EV specific
    brandName: '',
    modelName: '',
    trimName: '',
    manufactureYear: '',
    bodyStyle: '',
    origin: 'noi_dia' as 'noi_dia' | 'nhap_khau',
    colorName: '',
    seats: '',
    condition: 'used' as 'new' | 'used',
    licensePlate: '',
    odoKm: '',
    batteryCapacityKWh: '',

    // Battery specific
    brand: '',
    year: '',
    cyclesUsed: '',
    healthPercent: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { postType, formData });
    // TODO: Implement API call
    alert('Tin đăng đã được gửi! (Demo)');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priceVnd: '',
      addressText: '',
      brandName: '',
      modelName: '',
      trimName: '',
      manufactureYear: '',
      bodyStyle: '',
      origin: 'noi_dia',
      colorName: '',
      seats: '',
      condition: 'used',
      licensePlate: '',
      odoKm: '',
      batteryCapacityKWh: '',
      brand: '',
      year: '',
      cyclesUsed: '',
      healthPercent: '',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-2">
            Đăng tin bán
          </h1>
          <p className="text-muted-foreground">Tạo tin đăng để bán EV hoặc pin EV của bạn</p>
        </div>

        {/* Post Type Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Chọn loại tin đăng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPostType('ev')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  postType === 'ev'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Car className="h-8 w-8 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">Xe điện (EV)</div>
                    <div className="text-sm text-muted-foreground">Đăng bán xe điện</div>
                  </div>
                  {postType === 'ev' && (
                    <Badge className="ml-auto bg-green-100 text-green-800 border-green-200">
                      Đã chọn
                    </Badge>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPostType('battery')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  postType === 'battery'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Battery className="h-8 w-8 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Pin EV</div>
                    <div className="text-sm text-muted-foreground">Đăng bán pin EV</div>
                  </div>
                  {postType === 'battery' && (
                    <Badge className="ml-auto bg-blue-100 text-blue-800 border-blue-200">
                      Đã chọn
                    </Badge>
                  )}
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin cơ bản
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Tiêu đề tin đăng *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={
                      postType === 'ev'
                        ? 'VinFast VF e34 - 2022 - Màu xanh'
                        : 'Pack pin EV 60kWh - còn 90% SOH'
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price" className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Giá bán (VND) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.priceVnd}
                    onChange={(e) => handleInputChange('priceVnd', e.target.value)}
                    placeholder="385000000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Địa chỉ *
                  </Label>
                  <Input
                    id="address"
                    value={formData.addressText}
                    onChange={(e) => handleInputChange('addressText', e.target.value)}
                    placeholder="Quận 1, TP. Hồ Chí Minh"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Mô tả chi tiết</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={
                      postType === 'ev'
                        ? 'Xe gia đình sử dụng kỹ, bảo dưỡng định kỳ tại hãng, pin còn tốt.'
                        : 'Pack tháo xe, đã test dung lượng, phù hợp thay thế hoặc dự phòng.'
                    }
                    className="w-full min-h-24 px-3 py-2 border border-input rounded-md resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EV Specific Fields */}
          {postType === 'ev' && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Thông tin xe điện
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brandName" className="flex items-center gap-1">
                      <Car className="h-4 w-4" />
                      Hãng xe *
                    </Label>
                    <Input
                      id="brandName"
                      value={formData.brandName}
                      onChange={(e) => handleInputChange('brandName', e.target.value)}
                      placeholder="VinFast"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="modelName">Model *</Label>
                    <Input
                      id="modelName"
                      value={formData.modelName}
                      onChange={(e) => handleInputChange('modelName', e.target.value)}
                      placeholder="VF e34"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="trimName">Phiên bản</Label>
                    <Input
                      id="trimName"
                      value={formData.trimName}
                      onChange={(e) => handleInputChange('trimName', e.target.value)}
                      placeholder="Standard"
                    />
                  </div>

                  <div>
                    <Label htmlFor="manufactureYear" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Năm sản xuất *
                    </Label>
                    <Input
                      id="manufactureYear"
                      type="number"
                      value={formData.manufactureYear}
                      onChange={(e) => handleInputChange('manufactureYear', e.target.value)}
                      placeholder="2022"
                      min="2010"
                      max="2025"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="odoKm" className="flex items-center gap-1">
                      <Gauge className="h-4 w-4" />
                      Số km đã đi *
                    </Label>
                    <Input
                      id="odoKm"
                      type="number"
                      value={formData.odoKm}
                      onChange={(e) => handleInputChange('odoKm', e.target.value)}
                      placeholder="23000"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="batteryCapacity" className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      Dung lượng pin (kWh) *
                    </Label>
                    <Input
                      id="batteryCapacity"
                      type="number"
                      value={formData.batteryCapacityKWh}
                      onChange={(e) => handleInputChange('batteryCapacityKWh', e.target.value)}
                      placeholder="42"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="colorName" className="flex items-center gap-1">
                      <Palette className="h-4 w-4" />
                      Màu sắc
                    </Label>
                    <Input
                      id="colorName"
                      value={formData.colorName}
                      onChange={(e) => handleInputChange('colorName', e.target.value)}
                      placeholder="Xanh"
                    />
                  </div>

                  <div>
                    <Label htmlFor="licensePlate" className="flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      Biển số xe
                    </Label>
                    <Input
                      id="licensePlate"
                      value={formData.licensePlate}
                      onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                      placeholder="51H-123.45"
                    />
                  </div>

                  <div>
                    <Label htmlFor="seats">Số chỗ ngồi</Label>
                    <Input
                      id="seats"
                      type="number"
                      value={formData.seats}
                      onChange={(e) => handleInputChange('seats', e.target.value)}
                      placeholder="5"
                      min="2"
                      max="9"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bodyStyle">Kiểu dáng</Label>
                    <Input
                      id="bodyStyle"
                      value={formData.bodyStyle}
                      onChange={(e) => handleInputChange('bodyStyle', e.target.value)}
                      placeholder="Crossover"
                    />
                  </div>

                  <div>
                    <Label htmlFor="condition">Tình trạng xe *</Label>
                    <select
                      id="condition"
                      value={formData.condition}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md"
                      required
                    >
                      <option value="new">Mới</option>
                      <option value="used">Đã sử dụng</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="origin">Xuất xứ</Label>
                    <select
                      id="origin"
                      value={formData.origin}
                      onChange={(e) => handleInputChange('origin', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="noi_dia">Nội địa</option>
                      <option value="nhap_khau">Nhập khẩu</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Battery Specific Fields */}
          {postType === 'battery' && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Battery className="h-5 w-5" />
                  Thông tin pin EV
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batteryBrand" className="flex items-center gap-1">
                      <Battery className="h-4 w-4" />
                      Hãng pin *
                    </Label>
                    <Input
                      id="batteryBrand"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="CATL"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="batteryYear" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Năm sản xuất *
                    </Label>
                    <Input
                      id="batteryYear"
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      placeholder="2021"
                      min="2010"
                      max="2025"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="batteryCapacityBattery" className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      Dung lượng pin (kWh) *
                    </Label>
                    <Input
                      id="batteryCapacityBattery"
                      type="number"
                      value={formData.batteryCapacityKWh}
                      onChange={(e) => handleInputChange('batteryCapacityKWh', e.target.value)}
                      placeholder="60"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cyclesUsed" className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      Số chu kỳ sạc
                    </Label>
                    <Input
                      id="cyclesUsed"
                      type="number"
                      value={formData.cyclesUsed}
                      onChange={(e) => handleInputChange('cyclesUsed', e.target.value)}
                      placeholder="320"
                    />
                  </div>

                  <div>
                    <Label htmlFor="healthPercent" className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Health (%)
                    </Label>
                    <Input
                      id="healthPercent"
                      type="number"
                      value={formData.healthPercent}
                      onChange={(e) => handleInputChange('healthPercent', e.target.value)}
                      placeholder="90"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Upload */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Hình ảnh
              </h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Kéo thả hình ảnh vào đây hoặc</p>
                <Button type="button" variant="outline">
                  Chọn hình ảnh
                </Button>
                <p className="text-sm text-gray-500 mt-2">Hỗ trợ: JPG, PNG, GIF (tối đa 10MB)</p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={resetForm}>
              Đặt lại
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              Đăng tin
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
