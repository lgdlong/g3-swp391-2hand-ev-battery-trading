'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Battery, Upload, FileText, X } from 'lucide-react';
import { getCarBrands, getBikeBrands, getCarModels, getBikeModels } from '@/lib/api/catalogApi';
import { Brand, Model } from '@/types/catalog';
import { useRouter } from 'next/navigation';

type PostType = 'ev' | 'battery';

export default function CreatePostPage() {
  const router = useRouter();
  const [postType, setPostType] = useState<PostType | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [formData, setFormData] = useState({
    // Common fields
    title: '',
    description: '',
    priceVnd: '',
    addressText: '',

    // EV specific
    vehicleType: 'xe_hoi' as 'xe_hoi' | 'xe_may',
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
      vehicleType: 'xe_hoi',
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

  const handlePostTypeSelect = (type: PostType) => {
    setPostType(type);
    setShowModal(false);
    resetForm();
  };

  const handleChangePostType = () => {
    setPostType(null);
    setShowModal(true);
  };

  // Load brands when vehicle type changes
  useEffect(() => {
    if (postType === 'ev' && formData.vehicleType) {
      // Reset brand name when vehicle type changes
      setFormData((prev) => ({ ...prev, brandName: '' }));

      setLoadingBrands(true);
      const loadBrands = async () => {
        try {
          let brandsData: Brand[] = [];
          if (formData.vehicleType === 'xe_hoi') {
            brandsData = await getCarBrands();
          } else if (formData.vehicleType === 'xe_may') {
            brandsData = await getBikeBrands();
          }
          setBrands(brandsData);
        } catch (error) {
          console.error('Error loading brands:', error);
          setBrands([]);
        } finally {
          setLoadingBrands(false);
        }
      };
      loadBrands();
    }
  }, [postType, formData.vehicleType]);

  // Load models when brand changes
  useEffect(() => {
    if (postType === 'ev' && formData.brandName && brands.length > 0) {
      // Find the selected brand to get its ID
      const selectedBrand = brands.find((brand) => brand.name === formData.brandName);
      if (selectedBrand) {
        // Reset model name when brand changes
        setFormData((prev) => ({ ...prev, modelName: '' }));

        setLoadingModels(true);
        const loadModels = async () => {
          try {
            let modelsData: Model[] = [];
            if (formData.vehicleType === 'xe_hoi') {
              modelsData = await getCarModels(selectedBrand.id);
            } else if (formData.vehicleType === 'xe_may') {
              modelsData = await getBikeModels(selectedBrand.id);
            }
            setModels(modelsData);
          } catch (error) {
            console.error('Error loading models:', error);
            setModels([]);
          } finally {
            setLoadingModels(false);
          }
        };
        loadModels();
      }
    }
  }, [postType, formData.brandName, formData.vehicleType, brands]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Modal for Post Type Selection */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Chọn loại tin đăng</h2>
                <button
                  onClick={() => router.back()}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <p className="text-gray-600 mb-6">Vui lòng chọn loại sản phẩm bạn muốn đăng bán:</p>

              <div className="space-y-4">
                <button
                  onClick={() => handlePostTypeSelect('ev')}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                      <Car className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900">Xe điện (EV)</div>
                      <div className="text-sm text-gray-600">Đăng bán xe điện, xe máy điện</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handlePostTypeSelect('battery')}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      <Battery className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900">Pin EV</div>
                      <div className="text-sm text-gray-600">Đăng bán pin xe điện, pack pin</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {postType && (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-2">
                    Đăng tin bán {postType === 'ev' ? 'Xe điện' : 'Pin EV'}
                  </h1>
                  <p className="text-muted-foreground">
                    Tạo tin đăng để bán {postType === 'ev' ? 'xe điện' : 'pin EV'} của bạn
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleChangePostType}
                  className="flex items-center gap-2"
                >
                  {postType === 'ev' ? (
                    <Car className="h-4 w-4" />
                  ) : (
                    <Battery className="h-4 w-4" />
                  )}
                  Đổi loại tin đăng
                </Button>
              </div>
            </div>

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
                      <Label htmlFor="title">
                        Tiêu đề tin đăng <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder={
                          postType === 'ev'
                            ? 'VinFast VF e34 - 2022 - Màu xanh'
                            : 'Pack pin EV 60kWh - còn 90% SOH'
                        }
                        className="text-base"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="price">
                        Giá bán (VND) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.priceVnd}
                        onChange={(e) => handleInputChange('priceVnd', e.target.value)}
                        placeholder="385000000"
                        className="text-base"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">
                        Địa chỉ <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        value={formData.addressText}
                        onChange={(e) => handleInputChange('addressText', e.target.value)}
                        placeholder="Quận 1, TP. Hồ Chí Minh"
                        className="text-base"
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
                        className="w-full min-h-24 px-3 py-2 border border-input rounded-md resize-none text-base"
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
                        <Label htmlFor="vehicleType">
                          Loại xe <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="vehicleType"
                          value={formData.vehicleType}
                          onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md text-base"
                          required
                        >
                          <option value="xe_hoi">Xe hơi</option>
                          <option value="xe_may">Xe máy</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="brandName">
                          Hãng xe <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="brandName"
                          value={formData.brandName}
                          onChange={(e) => handleInputChange('brandName', e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md text-base"
                          required
                          disabled={loadingBrands}
                        >
                          <option value="">{loadingBrands ? 'Đang tải...' : 'Chọn hãng xe'}</option>
                          {brands.map((brand) => (
                            <option key={brand.id} value={brand.name}>
                              {brand.name}
                            </option>
                          ))}
                          <option value="Khác">Khác</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="modelName">
                          Model <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="modelName"
                          value={formData.modelName}
                          onChange={(e) => handleInputChange('modelName', e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md text-base"
                          required
                          disabled={loadingModels || !formData.brandName}
                        >
                          <option value="">
                            {loadingModels
                              ? 'Đang tải...'
                              : !formData.brandName
                                ? 'Chọn hãng xe trước'
                                : 'Chọn model'}
                          </option>
                          {models.map((model) => (
                            <option key={model.id} value={model.name}>
                              {model.name}
                            </option>
                          ))}
                          <option value="Khác">Khác</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="trimName">Phiên bản</Label>
                        <Input
                          id="trimName"
                          value={formData.trimName}
                          onChange={(e) => handleInputChange('trimName', e.target.value)}
                          placeholder="Standard"
                          className="text-base"
                        />
                      </div>

                      <div>
                        <Label htmlFor="manufactureYear">
                          Năm sản xuất <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="manufactureYear"
                          value={formData.manufactureYear}
                          onChange={(e) => handleInputChange('manufactureYear', e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md text-base"
                          required
                        >
                          <option value="">Chọn năm sản xuất</option>
                          {Array.from({ length: 36 }, (_, i) => 2025 - i).map((year) => (
                            <option key={year} value={year.toString()}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="odoKm">
                          Số km đã đi <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="odoKm"
                          type="number"
                          value={formData.odoKm}
                          onChange={(e) => handleInputChange('odoKm', e.target.value)}
                          placeholder="23000"
                          className="text-base"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="batteryCapacity">
                          Dung lượng pin (kWh) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="batteryCapacity"
                          type="number"
                          value={formData.batteryCapacityKWh}
                          onChange={(e) => handleInputChange('batteryCapacityKWh', e.target.value)}
                          placeholder="42"
                          className="text-base"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="colorName">Màu sắc</Label>
                        <select
                          id="colorName"
                          value={formData.colorName}
                          onChange={(e) => handleInputChange('colorName', e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md text-base"
                        >
                          <option value="">Chọn màu sắc</option>
                          <option value="Trắng">Trắng</option>
                          <option value="Đen">Đen</option>
                          <option value="Xám">Xám</option>
                          <option value="Bạc">Bạc</option>
                          <option value="Đỏ">Đỏ</option>
                          <option value="Xanh dương">Xanh dương</option>
                          <option value="Xanh lá">Xanh lá</option>
                          <option value="Vàng">Vàng</option>
                          <option value="Cam">Cam</option>
                          <option value="Tím">Tím</option>
                          <option value="Nâu">Nâu</option>
                          <option value="Hồng">Hồng</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="licensePlate">Biển số xe</Label>
                        <Input
                          id="licensePlate"
                          value={formData.licensePlate}
                          onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                          placeholder="51H-123.45"
                          className="text-base"
                        />
                      </div>

                      <div>
                        <Label htmlFor="seats">Số chỗ ngồi</Label>
                        <select
                          id="seats"
                          value={formData.seats}
                          onChange={(e) => handleInputChange('seats', e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md text-base"
                        >
                          <option value="">Chọn số chỗ ngồi</option>
                          <option value="5">5 chỗ</option>
                          <option value="8">8 chỗ</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="bodyStyle">Kiểu dáng</Label>
                        <Input
                          id="bodyStyle"
                          value={formData.bodyStyle}
                          onChange={(e) => handleInputChange('bodyStyle', e.target.value)}
                          placeholder="Crossover"
                          className="text-base"
                        />
                      </div>

                      <div>
                        <Label htmlFor="condition">
                          Tình trạng xe <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="condition"
                          value={formData.condition}
                          onChange={(e) => handleInputChange('condition', e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md text-base"
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
                          className="w-full px-3 py-2 border border-input rounded-md text-base"
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
                        <Label htmlFor="batteryBrand">
                          Hãng pin <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="batteryBrand"
                          value={formData.brand}
                          onChange={(e) => handleInputChange('brand', e.target.value)}
                          placeholder="CATL"
                          className="text-base"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="batteryYear">
                          Năm sản xuất <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="batteryYear"
                          value={formData.year}
                          onChange={(e) => handleInputChange('year', e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md text-base"
                          required
                        >
                          <option value="">Chọn năm sản xuất</option>
                          {Array.from({ length: 36 }, (_, i) => 2025 - i).map((year) => (
                            <option key={year} value={year.toString()}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="batteryCapacityBattery">
                          Dung lượng pin (kWh) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="batteryCapacityBattery"
                          type="number"
                          value={formData.batteryCapacityKWh}
                          onChange={(e) => handleInputChange('batteryCapacityKWh', e.target.value)}
                          placeholder="60"
                          className="text-base"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="cyclesUsed">Số chu kỳ sạc</Label>
                        <Input
                          id="cyclesUsed"
                          type="number"
                          value={formData.cyclesUsed}
                          onChange={(e) => handleInputChange('cyclesUsed', e.target.value)}
                          placeholder="320"
                          className="text-base"
                        />
                      </div>

                      <div>
                        <Label htmlFor="healthPercent">Health (%)</Label>
                        <Input
                          id="healthPercent"
                          type="number"
                          value={formData.healthPercent}
                          onChange={(e) => handleInputChange('healthPercent', e.target.value)}
                          placeholder="90"
                          min="0"
                          max="100"
                          className="text-base"
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
                    <p className="text-sm text-gray-500 mt-2">
                      Hỗ trợ: JPG, PNG, GIF (tối đa 10MB)
                    </p>
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
          </>
        )}
      </div>
    </div>
  );
}
