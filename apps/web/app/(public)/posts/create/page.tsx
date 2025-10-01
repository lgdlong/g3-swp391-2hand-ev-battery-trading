'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Battery, Upload, FileText, X } from 'lucide-react';
import { getCarBrands, getBikeBrands, getCarModels, getBikeModels } from '@/lib/api/catalogApi';
import { Brand, Model } from '@/types/catalog';
import { useRouter } from 'next/navigation';
import { createCarPost, createBikePost, uploadPostImages } from '@/lib/api/postApi';
import { toast } from 'sonner';

type PostType = 'ev' | 'battery';

export default function CreatePostPage() {
  const router = useRouter();
  const [postType, setPostType] = useState<PostType | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    // Common fields
    title: '',
    description: '',
    priceVnd: '',
    addressText: '',
    wardCode: '',
    isNegotiable: false,

    // EV specific
    vehicleType: 'xe_hoi' as 'xe_hoi' | 'xe_may',
    brandId: '',
    modelId: '',
    manufactureYear: '',
    bodyStyle: 'SEDAN' as 'SEDAN' | 'SUV' | 'HATCHBACK' | 'COUPE',
    bikeStyle: 'SCOOTER' as 'SCOOTER' | 'SPORT' | 'CRUISER',
    origin: 'NOI_DIA' as 'NOI_DIA' | 'NHAP_KHAU',
    color: 'BLACK' as 'BLACK' | 'WHITE' | 'RED' | 'BLUE' | 'SILVER',
    seats: '',
    licensePlate: '',
    ownersCount: '',
    odoKm: '',
    batteryCapacityKwh: '',
    rangeKm: '',
    chargeAcKw: '',
    chargeDcKw: '',
    motorPowerKw: '',
    batteryHealthPct: '',

    // Battery specific (keep as is)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postType) {
      toast.error('Vui lòng chọn loại tin đăng');
      return;
    }

    if (postType === 'battery') {
      // Keep battery logic as is (demo)
      console.log('Battery form submitted:', { postType, formData });
      toast.success('Tin đăng pin đã được gửi! (Demo)');
      return;
    }

    // EV post logic with real API
    setIsSubmitting(true);

    try {
      // Step 1: Create post (car or bike)
      let createdPost;

      if (formData.vehicleType === 'xe_hoi') {
        // Create car post
        const carPostData = {
          postType: 'EV_CAR' as const,
          title: formData.title,
          description: formData.description,
          wardCode: formData.wardCode || '00001', // Default ward code
          priceVnd: formData.priceVnd,
          isNegotiable: formData.isNegotiable,
          carDetails: {
            brand_id: parseInt(formData.brandId) || 1,
            model_id: parseInt(formData.modelId) || 1,
            manufacture_year: parseInt(formData.manufactureYear) || new Date().getFullYear(),
            body_style: formData.bodyStyle,
            origin: formData.origin,
            color: formData.color,
            seats: parseInt(formData.seats) || 5,
            license_plate: formData.licensePlate,
            owners_count: parseInt(formData.ownersCount) || 1,
            odo_km: parseInt(formData.odoKm) || 0,
            battery_capacity_kwh: parseFloat(formData.batteryCapacityKwh) || 0,
            range_km: parseInt(formData.rangeKm) || 0,
            charge_ac_kw: parseFloat(formData.chargeAcKw) || 0,
            charge_dc_kw: parseFloat(formData.chargeDcKw) || 0,
            battery_health_pct: parseFloat(formData.batteryHealthPct) || 0,
          },
        };

        createdPost = await createCarPost(carPostData);
      } else {
        // Create bike post
        const bikePostData = {
          postType: 'EV_BIKE' as const,
          title: formData.title,
          description: formData.description,
          wardCode: formData.wardCode || '00001', // Default ward code
          priceVnd: formData.priceVnd,
          isNegotiable: formData.isNegotiable,
          bikeDetails: {
            brand_id: parseInt(formData.brandId) || 1,
            model_id: parseInt(formData.modelId) || 1,
            manufacture_year: parseInt(formData.manufactureYear) || new Date().getFullYear(),
            bike_style: formData.bikeStyle,
            origin: formData.origin,
            color: formData.color,
            license_plate: formData.licensePlate,
            owners_count: parseInt(formData.ownersCount) || 1,
            odo_km: parseInt(formData.odoKm) || 0,
            battery_capacity_kwh: parseFloat(formData.batteryCapacityKwh) || 0,
            range_km: parseInt(formData.rangeKm) || 0,
            motor_power_kw: parseFloat(formData.motorPowerKw) || 0,
            charge_ac_kw: parseFloat(formData.chargeAcKw) || 0,
            battery_health_pct: parseFloat(formData.batteryHealthPct) || 0,
          },
        };

        createdPost = await createBikePost(bikePostData);
      }

      toast.success('Tạo bài đăng thành công!');

      // Save the created post ID for image upload step
      setCreatedPostId(createdPost.id);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Tạo bài đăng thất bại';
      toast.error(`Tạo bài đăng thất bại: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async () => {
    if (!createdPostId || selectedFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 hình ảnh');
      return;
    }

    setIsUploadingImages(true);

    try {
      await uploadPostImages(createdPostId, selectedFiles);
      toast.success('Upload ảnh thành công!');

      // Redirect to the created post
      router.push(`/posts/ev/${createdPostId}`);
    } catch (error: any) {
      console.error('Failed to upload images:', error);
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Upload ảnh thất bại';

      // If it's a 404/500 (endpoint not implemented), show warning but continue
      if (error?.response?.status === 404 || error?.response?.status === 500) {
        toast.warning('API upload chưa sẵn sàng. Đang chuyển đến trang post...');
        setTimeout(() => {
          router.push(`/posts/ev/${createdPostId}`);
        }, 2000);
      } else {
        toast.error(`Upload ảnh thất bại: ${errorMessage}`);
      }
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 10) {
      toast.error('Chỉ được chọn tối đa 10 ảnh');
      return;
    }

    setSelectedFiles(files);

    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);

    // Revoke the URL to free memory
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }

    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const skipImageUpload = () => {
    if (createdPostId) {
      router.push(`/posts/ev/${createdPostId}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priceVnd: '',
      addressText: '',
      wardCode: '',
      isNegotiable: false,
      vehicleType: 'xe_hoi',
      brandId: '',
      modelId: '',
      manufactureYear: '',
      bodyStyle: 'SEDAN',
      bikeStyle: 'SCOOTER',
      origin: 'NOI_DIA',
      color: 'BLACK',
      seats: '',
      licensePlate: '',
      ownersCount: '',
      odoKm: '',
      batteryCapacityKwh: '',
      rangeKm: '',
      chargeAcKw: '',
      chargeDcKw: '',
      motorPowerKw: '',
      batteryHealthPct: '',
      brand: '',
      year: '',
      cyclesUsed: '',
      healthPercent: '',
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
    setCreatedPostId(null);
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
      // Reset brand ID when vehicle type changes
      setFormData((prev) => ({ ...prev, brandId: '', modelId: '' }));

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
    if (postType === 'ev' && formData.brandId && brands.length > 0) {
      // Find the selected brand to get its info
      const selectedBrand = brands.find((brand) => brand.id.toString() === formData.brandId);
      if (selectedBrand) {
        // Reset model ID when brand changes
        setFormData((prev) => ({ ...prev, modelId: '' }));

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
  }, [postType, formData.brandId, formData.vehicleType, brands]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Modal for Post Type Selection */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-md">
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
                  className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-[#048C73] hover:bg-[#048C73]/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-gray-100 group-hover:bg-[#048C73]/10 transition-colors">
                      <Car className="h-8 w-8 text-gray-600 group-hover:text-[#048C73]" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900">Xe điện (EV)</div>
                      <div className="text-sm text-gray-600">Đăng bán xe điện, xe máy điện</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handlePostTypeSelect('battery')}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-[#048C73] hover:bg-[#048C73]/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-gray-100 group-hover:bg-[#048C73]/10 transition-colors">
                      <Battery className="h-8 w-8 text-gray-600 group-hover:text-[#048C73]" />
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
        {/* Step 1: Create Post Form */}
        {postType && !createdPostId && (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                    Đăng tin bán {postType === 'ev' ? 'Xe điện' : 'Pin EV'}
                  </h1>
                  <p className="text-muted-foreground">
                    Tạo tin đăng để bán {postType === 'ev' ? 'xe điện' : 'pin EV'} của bạn
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleChangePostType}
                  className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-[#048C73]/5 hover:border-[#048C73] hover:text-[#048C73]"
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
                        <Label htmlFor="brandId">
                          Hãng xe <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="brandId"
                          value={formData.brandId}
                          onChange={(e) => handleInputChange('brandId', e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md text-base"
                          required
                          disabled={loadingBrands}
                        >
                          <option value="">{loadingBrands ? 'Đang tải...' : 'Chọn hãng xe'}</option>
                          {brands.map((brand) => (
                            <option key={brand.id} value={brand.id.toString()}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="modelId">
                          Model <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="modelId"
                          value={formData.modelId}
                          onChange={(e) => handleInputChange('modelId', e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md text-base"
                          required
                          disabled={loadingModels || !formData.brandId}
                        >
                          <option value="">
                            {loadingModels
                              ? 'Đang tải...'
                              : !formData.brandId
                                ? 'Chọn hãng xe trước'
                                : 'Chọn model'}
                          </option>
                          {models.map((model) => (
                            <option key={model.id} value={model.id.toString()}>
                              {model.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="trimName">Phiên bản</Label>
                        <Input
                          id="trimName"
                          value={formData.licensePlate}
                          onChange={(e) => handleInputChange('licensePlate', e.target.value)}
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
                          value={formData.batteryCapacityKwh}
                          onChange={(e) => handleInputChange('batteryCapacityKwh', e.target.value)}
                          placeholder="42"
                          className="text-base"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="colorName">Màu sắc</Label>
                        <select
                          id="colorName"
                          value={formData.color}
                          onChange={(e) => handleInputChange('color', e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md text-base"
                        >
                          <option value="">Chọn màu sắc</option>
                          <option value="WHITE">Trắng</option>
                          <option value="BLACK">Đen</option>
                          <option value="GRAY">Xám</option>
                          <option value="SILVER">Bạc</option>
                          <option value="RED">Đỏ</option>
                          <option value="BLUE">Xanh dương</option>
                          <option value="GREEN">Xanh lá</option>
                          <option value="YELLOW">Vàng</option>
                          <option value="ORANGE">Cam</option>
                          <option value="PURPLE">Tím</option>
                          <option value="BROWN">Nâu</option>
                          <option value="PINK">Hồng</option>
                          <option value="OTHER">Khác</option>
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
                          value={formData.ownersCount}
                          onChange={(e) => handleInputChange('ownersCount', e.target.value)}
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
                          <option value="NOI_DIA">Nội địa</option>
                          <option value="NHAP_KHAU">Nhập khẩu</option>
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
                          value={formData.batteryCapacityKwh}
                          onChange={(e) => handleInputChange('batteryCapacityKwh', e.target.value)}
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

              {/* Submit Buttons */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-gray-300 text-gray-700 hover:bg-[#048C73]/5 hover:border-[#048C73] hover:text-[#048C73]"
                >
                  Đặt lại
                </Button>
                <Button
                  type="submit"
                  className="bg-[#048C73] hover:bg-[#037A66] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang đăng tin...' : 'Đăng tin'}
                </Button>
              </div>
            </form>
          </>
        )}

        {/* Step 2: Upload Images Section */}
        {createdPostId && (
          <div className="mt-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Bước 2: Thêm hình ảnh</h2>
                  <p className="text-gray-600">
                    Bài đăng đã được tạo thành công! Bây giờ hãy thêm hình ảnh để thu hút người mua.
                  </p>
                </div>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Kéo thả hình ảnh vào đây hoặc
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#048C73] text-[#048C73] hover:bg-[#048C73] hover:text-white"
                    >
                      Chọn hình ảnh
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      Hỗ trợ: JPG, PNG, GIF (tối đa 10MB mỗi ảnh, tối đa 10 ảnh)
                    </p>
                  </label>
                </div>

                {/* Image Previews */}
                {previewUrls.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Xem trước hình ảnh:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            width={200}
                            height={128}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={skipImageUpload}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Bỏ qua (Hoàn thành sau)
                  </Button>
                  <Button
                    onClick={handleImageUpload}
                    disabled={selectedFiles.length === 0 || isUploadingImages}
                    className="bg-[#048C73] hover:bg-[#037A66] text-white"
                  >
                    {isUploadingImages ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Đang upload...
                      </>
                    ) : (
                      `Upload ${selectedFiles.length} ảnh`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
