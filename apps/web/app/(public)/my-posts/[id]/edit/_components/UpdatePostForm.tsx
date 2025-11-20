'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateMyPost, uploadPostImages, deleteImage } from '@/lib/api/postApi';
import { ImageDiffPayload, Post } from '@/types/post';
import { Brand, Model } from '@/types/catalog';
import BatteryDetailsForm from '../../../../posts/create/_components/BatteryDetailsForm';
import EVDetailsForm from '../../../../posts/create/_components/EVDetailsForm';
import BasicInfoForm from './BasicInfoForm';
import { useAddressState } from '../hooks/useAddressState';
import { useEVFormState } from '../hooks/useEVFormState';
import { useBatteryFormState } from '../hooks/useBatteryFormState';

interface UpdatePostFormProps {
  post: Post;
  imageDiff?: ImageDiffPayload | null;
}

export default function UpdatePostForm({ post, imageDiff }: UpdatePostFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use custom hooks for state management
  const {
    basicData,
    setBasicData,
    isAddressDialogOpen,
    setIsAddressDialogOpen,
    tempProvinceCode,
    tempDistrictCode,
    tempWardCode,
    handleCancelAddressDialog,
    handleConfirmAddressDialog,
    handleTempProvinceChange,
    handleTempDistrictChange,
    handleTempWardChange,
  } = useAddressState(post);

  const { evFormData, setEvFormData, brands, models, loadingBrands, loadingModels } =
    useEVFormState(post);

  const { batteryFormData, setBatteryFormData } = useBatteryFormState(post);

  const handleBasicInputChange = (field: string, value: string | boolean) => {
    setBasicData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEvInputChange = (field: string, value: string) => {
    setEvFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBatteryInputChange = (field: string, value: string) => {
    setBatteryFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return updateMyPost(post.id, data);
    },
    onSuccess: () => {
      toast.success('Cập nhật tin đăng thành công!');
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      // Redirect back to my posts
      router.push('/my-posts');
    },
    onError: (error: unknown) => {
      console.error('Update post error:', error);
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
          ? String(error.response.data.message)
          : 'Có lỗi xảy ra khi cập nhật tin đăng';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (
    e: React.FormEvent | undefined,
    status?: 'DRAFT' | 'PENDING_REVIEW',
  ) => {
    if (e) {
      e.preventDefault();
    }

    // Validate required fields
    if (!basicData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề tin đăng');
      return;
    }

    if (!basicData.priceVnd || parseFloat(basicData.priceVnd) <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return;
    }

    // Process image diff if there are changes
    if (imageDiff) {
      try {
        // 1. Delete removed images from Cloudinary
        if (imageDiff.toDelete.length > 0) {
          toast.info(`Đang xoá ${imageDiff.toDelete.length} ảnh...`);
          await Promise.all(
            imageDiff.toDelete.map(async (publicId) => {
              try {
                await deleteImage(publicId);
              } catch (error) {
                console.error(`Failed to delete image ${publicId}:`, error);
                // Continue even if one delete fails
              }
            }),
          );
          toast.success(`Đã xoá ${imageDiff.toDelete.length} ảnh`);
        }

        // 2. TODO: Update positions for kept images
        // This requires a backend endpoint to reorder images
        // Example: await updateImagePositions({ postId: post.id, images: imageDiff.toKeep });
        if (imageDiff.toKeep.length > 0) {
          // Backend needs to implement: PATCH /posts/:id/images/positions
        }

        // 3. Upload new images to Cloudinary
        if (imageDiff.toUpload.length > 0) {
          toast.info(`Đang tải lên ${imageDiff.toUpload.length} ảnh mới...`);
          const filesToUpload = imageDiff.toUpload.map((item) => item.file);
          await uploadPostImages(post.id, filesToUpload);
          toast.success(`Đã tải lên ${imageDiff.toUpload.length} ảnh mới`);
          // Note: uploadPostImages automatically links images to the post
        }
      } catch (error) {
        console.error('Image processing error:', error);
        toast.error('Có lỗi khi xử lý hình ảnh');
        return; // Stop submission if image processing fails
      }
    }

    // Prepare update data based on post type
    const updateData: Record<string, unknown> = {
      title: basicData.title.trim(),
      description: basicData.description.trim(),
      priceVnd: parseFloat(basicData.priceVnd),
      isNegotiable: basicData.isNegotiable,
      wardCode: basicData.wardCode,
      provinceNameCached: basicData.provinceNameCached,
      districtNameCached: basicData.districtNameCached,
      wardNameCached: basicData.wardNameCached,
      addressTextCached: basicData.addressTextCached,
      status: status || post.status,
    };

    // Add type-specific details
    if (post.postType === 'EV_CAR') {
      updateData.carDetails = {
        brandId: evFormData.brandId ? parseInt(evFormData.brandId) : undefined,
        modelId: evFormData.modelId ? parseInt(evFormData.modelId) : undefined,
        manufactureYear: evFormData.manufactureYear
          ? parseInt(evFormData.manufactureYear)
          : undefined,
        bodyStyle: evFormData.bodyStyle,
        origin: evFormData.origin,
        color: evFormData.color,
        seats: evFormData.seats ? parseInt(evFormData.seats) : undefined,
        licensePlate: evFormData.licensePlate || undefined,
        ownersCount: evFormData.ownersCount ? parseInt(evFormData.ownersCount) : undefined,
        odoKm: evFormData.odoKm ? parseInt(evFormData.odoKm) : undefined,
        batteryCapacityKwh: evFormData.batteryCapacityKwh
          ? parseFloat(evFormData.batteryCapacityKwh)
          : undefined,
        rangeKm: evFormData.rangeKm ? parseInt(evFormData.rangeKm) : undefined,
        chargeAcKw: evFormData.chargeAcKw ? parseFloat(evFormData.chargeAcKw) : undefined,
        chargeDcKw: evFormData.chargeDcKw ? parseFloat(evFormData.chargeDcKw) : undefined,
        batteryHealthPct: evFormData.batteryHealthPct
          ? parseInt(evFormData.batteryHealthPct)
          : undefined,
      };
    } else if (post.postType === 'EV_BIKE') {
      updateData.bikeDetails = {
        brandId: evFormData.brandId ? parseInt(evFormData.brandId) : undefined,
        modelId: evFormData.modelId ? parseInt(evFormData.modelId) : undefined,
        manufactureYear: evFormData.manufactureYear
          ? parseInt(evFormData.manufactureYear)
          : undefined,
        bikeStyle: evFormData.bikeStyle,
        origin: evFormData.origin,
        color: evFormData.color,
        licensePlate: evFormData.licensePlate || undefined,
        ownersCount: evFormData.ownersCount ? parseInt(evFormData.ownersCount) : undefined,
        odoKm: evFormData.odoKm ? parseInt(evFormData.odoKm) : undefined,
        batteryCapacityKwh: evFormData.batteryCapacityKwh
          ? parseFloat(evFormData.batteryCapacityKwh)
          : undefined,
        rangeKm: evFormData.rangeKm ? parseInt(evFormData.rangeKm) : undefined,
        chargeAcKw: evFormData.chargeAcKw ? parseFloat(evFormData.chargeAcKw) : undefined,
        motorPowerKw: evFormData.motorPowerKw ? parseFloat(evFormData.motorPowerKw) : undefined,
        batteryHealthPct: evFormData.batteryHealthPct
          ? parseInt(evFormData.batteryHealthPct)
          : undefined,
      };
    } else if (post.postType === 'BATTERY') {
      updateData.batteryDetails = {
        brand_id: batteryFormData.brandId ? parseInt(batteryFormData.brandId) : undefined,
        voltageV: batteryFormData.voltageV ? parseFloat(batteryFormData.voltageV) : undefined,
        capacityAh: batteryFormData.capacityAh ? parseFloat(batteryFormData.capacityAh) : undefined,
        chargeTimeHours: batteryFormData.chargeTimeHours
          ? parseFloat(batteryFormData.chargeTimeHours)
          : undefined,
        chemistry: batteryFormData.chemistry || undefined,
        origin: batteryFormData.origin,
        weightKg: batteryFormData.weightKg ? parseFloat(batteryFormData.weightKg) : undefined,
        cycleLife: batteryFormData.cycleLife ? parseInt(batteryFormData.cycleLife) : undefined,
        rangeKm: batteryFormData.rangeKm ? parseInt(batteryFormData.rangeKm) : undefined,
        compatibleNotes: batteryFormData.compatibleNotes || undefined,
      };
    }

    updateMutation.mutate(updateData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <BasicInfoForm
        basicData={basicData}
        onInputChange={handleBasicInputChange}
        isAddressDialogOpen={isAddressDialogOpen}
        onAddressDialogChange={setIsAddressDialogOpen}
        onAddressConfirm={handleConfirmAddressDialog}
        onAddressCancel={handleCancelAddressDialog}
        tempProvinceCode={tempProvinceCode}
        tempDistrictCode={tempDistrictCode}
        tempWardCode={tempWardCode}
        onTempProvinceChange={handleTempProvinceChange}
        onTempDistrictChange={handleTempDistrictChange}
        onTempWardChange={handleTempWardChange}
      />

      {/* Post Type Specific Forms */}
      {(post.postType === 'EV_CAR' || post.postType === 'EV_BIKE') && (
        <EVDetailsForm
          formData={evFormData}
          brands={brands as Brand[]}
          models={models as Model[]}
          loadingBrands={loadingBrands}
          loadingModels={loadingModels}
          onInputChange={handleEvInputChange}
        />
      )}

      {post.postType === 'BATTERY' && (
        <BatteryDetailsForm formData={batteryFormData} onInputChange={handleBatteryInputChange} />
      )}

      {/* Submit Button */}
      <div className="flex justify-end items-center space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/my-posts')}
          disabled={updateMutation.isPending}
        >
          Hủy
        </Button>

        <Button
          type="button"
          disabled={updateMutation.isPending}
          onClick={() => handleSubmit(undefined, 'DRAFT')}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>Lưu nháp</>
          )}
        </Button>
      </div>
    </form>
  );
}
