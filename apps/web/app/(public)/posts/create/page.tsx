'use client';
import React from 'react';
import {
  PostTypeModal,
  BasicInfoForm,
  EVDetailsForm,
  BatteryDetailsForm,
  ImageUploadSection,
  FormHeader,
  FormActions,
} from './_components';
import { useCreatePost } from './_hooks/useCreatePost';
import { DepositModal } from '@/components/DepositModal';

export default function CreatePostPage() {
  const {
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
    isDepositModalOpen,
    pendingPostData,

    // Actions
    handleInputChange,
    handleSubmit,
    handleCreatePostAfterDeposit,
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
    setIsDepositModalOpen,

    // Helpers
    formatNumberWithCommas,
  } = useCreatePost();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Modal for Post Type Selection */}
      <PostTypeModal
        showModal={showModal}
        onPostTypeSelect={handlePostTypeSelect}
        onClose={() => {}}
      />

      <div className="max-w-4xl mx-auto">
        {/* Step 1: Create Post Form */}
        {postType && !createdPostId && (
          <>
            <FormHeader postType={postType} onChangePostType={handleChangePostType} />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <BasicInfoForm
                formData={formData}
                postType={postType}
                provinceCode={provinceCode}
                districtCode={districtCode}
                onInputChange={handleInputChange}
                onProvinceChange={handleProvinceChange}
                onDistrictChange={handleDistrictChange}
                onWardChange={handleWardChange}
                onAddressTextChange={handleAddressTextChange}
                formatNumberWithCommas={formatNumberWithCommas}
              />

              {/* EV Specific Fields */}
              {postType === 'ev' && (
                <EVDetailsForm
                  formData={formData}
                  brands={brands}
                  models={models}
                  loadingBrands={loadingBrands}
                  loadingModels={loadingModels}
                  onInputChange={handleInputChange}
                />
              )}

              {/* Battery Specific Fields */}
              {postType === 'battery' && (
                <BatteryDetailsForm formData={formData} onInputChange={handleInputChange} />
              )}

              {/* Submit Buttons */}
              <FormActions isSubmitting={isSubmitting} onReset={resetForm} />
            </form>
          </>
        )}

        {/* Step 2: Upload Images Section */}
        {createdPostId && (
          <ImageUploadSection
            selectedFiles={selectedFiles}
            previewUrls={previewUrls}
            isUploadingImages={isUploadingImages}
            onFileSelect={handleFileSelect}
            onRemoveImage={removeImage}
            onUploadImages={handleImageUpload}
            onSkipUpload={skipImageUpload}
          />
        )}
      </div>

      {/* Deposit Modal */}
      {pendingPostData && (
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          priceVnd={parseFloat(pendingPostData.priceVnd)}
          onSuccess={handleCreatePostAfterDeposit}
        />
      )}
    </div>
  );
}
