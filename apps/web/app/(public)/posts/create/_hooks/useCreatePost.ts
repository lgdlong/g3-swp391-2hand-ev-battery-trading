'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCarBrands, getBikeBrands, getCarModels, getBikeModels } from '@/lib/api/catalogApi';
import {
  createDraftCarPost,
  createDraftBikePost,
  createDraftBatteryPost,
  uploadPostImages,
} from '@/lib/api/postApi';
import { toast } from 'sonner';
import { Brand, Model } from '@/types/catalog';
import { PostType, FormData, initialFormData } from '@/types/form-data';

// Helpers: format thousand separators and strip non-digits for API
const formatNumberWithCommas = (value: string) =>
  value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const unformatNumber = (value: string) => value.replace(/\D/g, '');

export function useCreatePost() {
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
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Geo selections for cached address fields
  const [provinceCode, setProvinceCode] = useState<string>('');
  const [districtCode, setDistrictCode] = useState<string>('');

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Auto-set seats to "2" when vehicleType changes to "xe_may"
      if (field === 'vehicleType' && value === 'xe_may') {
        newData.seats = '2';
      }

      // Clear model when brand changes to "other" or when brand is cleared
      if (field === 'brandId' && (value === 'other' || value === '')) {
        newData.modelId = '';
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postType) {
      toast.error('Vui lòng chọn loại tin đăng');
      return;
    }

    // Validate price
    const priceValue = unformatNumber(formData.priceVnd);
    if (!priceValue || parseFloat(priceValue) <= 0) {
      toast.error('Vui lòng nhập giá bài đăng hợp lệ');
      return;
    }

    setIsSubmitting(true);

    try {
      let draftPost;

      if (postType === 'battery') {
        // Create draft battery post
        const batteryPostData = {
          postType: 'BATTERY' as const,
          title: formData.title,
          description: formData.description,
          wardCode: formData.wardCode || '00001',
          provinceNameCached: formData.provinceNameCached || '',
          districtNameCached: formData.districtNameCached || '',
          wardNameCached: formData.wardNameCached || '',
          addressTextCached: formData.addressTextCached || formData.addressText || '',
          priceVnd: unformatNumber(formData.priceVnd),
          isNegotiable: formData.isNegotiable,
          status: 'DRAFT' as const,
          batteryDetails: {
            ...(formData.brandId && formData.brandId !== ''
              ? { brand_id: parseInt(formData.brandId) }
              : {}),
            voltageV: parseFloat(formData.voltageV) || 0,
            capacityAh: parseFloat(formData.capacityAh) || 0,
            chargeTimeHours: parseFloat(formData.chargeTimeHours) || 0,
            ...(formData.chemistry !== '' ? { chemistry: formData.chemistry } : {}),
            origin: formData.origin,
            weightKg: parseFloat(formData.weightKg) || 0,
            cycleLife: parseInt(formData.cycleLife) || 0,
            rangeKm: parseInt(formData.rangeKm) || 0,
            compatibleNotes: formData.compatibleNotes || '',
          },
        };

        draftPost = await createDraftBatteryPost(batteryPostData);
      } else {
        // EV post logic (car or bike)
        if (formData.vehicleType === 'xe_hoi') {
          // Create draft car post
          const carPostData = {
            postType: 'EV_CAR' as const,
            title: formData.title,
            description: formData.description,
            wardCode: formData.wardCode || '00001',
            provinceNameCached: formData.provinceNameCached || '',
            districtNameCached: formData.districtNameCached || '',
            wardNameCached: formData.wardNameCached || '',
            addressTextCached: formData.addressTextCached || formData.addressText || '',
            priceVnd: unformatNumber(formData.priceVnd),
            isNegotiable: false,
            status: 'DRAFT' as const,
            carDetails: {
              ...(formData.brandId !== 'other' && formData.brandId
                ? { brand_id: parseInt(formData.brandId) }
                : {}),
              ...(formData.modelId !== 'other' && formData.modelId
                ? { model_id: parseInt(formData.modelId) }
                : {}),
              manufacture_year: parseInt(formData.manufactureYear) || new Date().getFullYear(),
              ...(formData.bodyStyle !== 'OTHER' && formData.bodyStyle
                ? { body_style: formData.bodyStyle }
                : {}),
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

          draftPost = await createDraftCarPost(carPostData);
        } else {
          // Create draft bike post
          const bikePostData = {
            postType: 'EV_BIKE' as const,
            title: formData.title,
            description: formData.description,
            wardCode: formData.wardCode || '00001',
            provinceNameCached: formData.provinceNameCached || '',
            districtNameCached: formData.districtNameCached || '',
            wardNameCached: formData.wardNameCached || '',
            addressTextCached: formData.addressTextCached || formData.addressText || '',
            priceVnd: unformatNumber(formData.priceVnd),
            isNegotiable: false,
            status: 'DRAFT' as const,
            bikeDetails: {
              ...(formData.brandId !== 'other' && formData.brandId
                ? { brand_id: parseInt(formData.brandId) }
                : {}),
              ...(formData.modelId !== 'other' && formData.modelId
                ? { model_id: parseInt(formData.modelId) }
                : {}),
              manufacture_year: parseInt(formData.manufactureYear) || new Date().getFullYear(),
              ...(formData.bikeStyle !== 'OTHER' && formData.bikeStyle
                ? { bike_style: formData.bikeStyle }
                : {}),
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

          draftPost = await createDraftBikePost(bikePostData);
        }
      }

      toast.success('Tạo bài đăng nháp thành công!');

      // Redirect to payment page
      router.push(`/posts/create/payment/${draftPost.id}`);
    } catch (error: unknown) {
      console.error('Failed to create draft post:', error);
      type ApiError = { response?: { data?: { message?: string } }; message?: string };
      const err = error as ApiError;
      const errorMessage = err?.response?.data?.message || err?.message || 'Tạo bài đăng thất bại';
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
    } catch (error: unknown) {
      console.error('Failed to upload images:', error);
      type ApiError = {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      const err = error as ApiError;
      const errorMessage = err?.response?.data?.message || err?.message || 'Upload ảnh thất bại';

      // If it's a 404/500 (endpoint not implemented), show warning but continue
      if (err?.response?.status === 404 || err?.response?.status === 500) {
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
    setFormData(initialFormData);
    setProvinceCode('');
    setDistrictCode('');
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

  const handleProvinceChange = (code: string, name: string) => {
    setProvinceCode(code);
    setDistrictCode('');
    setFormData((prev) => ({
      ...prev,
      provinceNameCached: name,
      districtNameCached: '',
      wardNameCached: '',
      wardCode: '',
    }));
  };

  const handleDistrictChange = (code: string, name: string) => {
    setDistrictCode(code);
    setFormData((prev) => ({
      ...prev,
      districtNameCached: name,
      wardNameCached: '',
      wardCode: '',
    }));
  };

  const handleWardChange = (code: string, name: string, addressCached: string) => {
    setFormData((prev) => ({
      ...prev,
      wardCode: code,
      wardNameCached: name,
      addressTextCached: addressCached,
    }));
  };

  const handleAddressTextChange = (value: string) => {
    const addressCached = [
      value,
      formData.wardNameCached,
      formData.districtNameCached,
      formData.provinceNameCached,
    ]
      .filter(Boolean)
      .join(', ');
    setFormData((prev) => ({
      ...prev,
      addressText: value,
      addressTextCached: addressCached,
    }));
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
    if (postType === 'ev') {
      if (formData.brandId && brands.length > 0) {
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
      } else if (!formData.brandId || formData.brandId === '') {
        // Clear models when brand is cleared or empty
        setModels([]);
        setFormData((prev) => ({ ...prev, modelId: '' }));
      }
    }
  }, [postType, formData.brandId, formData.vehicleType, brands]);

  return {
    // State
    postType,
    showModal,
    brands,
    loadingBrands,
    models,
    loadingModels,
    isSubmitting,
    selectedFiles,
    previewUrls,
    createdPostId,
    isUploadingImages,
    formData,
    provinceCode,
    districtCode,

    // Actions
    handleInputChange,
    handleSubmit,
    handleImageUpload,
    handleFileSelect,
    removeImage,
    skipImageUpload,
    resetForm,
    handlePostTypeSelect,
    handleChangePostType,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    handleAddressTextChange,

    // Helpers
    formatNumberWithCommas,
  };
}
