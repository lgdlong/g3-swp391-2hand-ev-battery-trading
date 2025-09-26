'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { getCurrentUser, updateCurrentUser, UpdateProfileDto } from '@/lib/api/accountApi';
import { Account } from '@/types/account';
import { User, Mail, Phone, Calendar, Shield, Edit3, Save, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validatingImage, setValidatingImage] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    avatarUrl: '',
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      // If not logged in, stop loading and show login prompt
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profileData = await getCurrentUser();
        setProfile(profileData);
        setFormData({
          fullName: profileData.fullName || '',
          phone: profileData.phone || '',
          avatarUrl: profileData.avatarUrl || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Không thể tải thông tin cá nhân';

        // If it's a token expiration, don't show toast as user will be redirected
        if (!errorMessage.includes('hết hạn')) {
          toast.error(errorMessage);
        }
      } finally {
        // Always set loading to false
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Real-time avatar URL validation
    if (field === 'avatarUrl') {
      setAvatarError(null);
      setAvatarPreview(null);

      if (value.trim()) {
        // Debounced validation
        const timeoutId = setTimeout(async () => {
          const isValid = await validateImageUrl(value.trim());
          if (isValid) {
            setAvatarPreview(value.trim());
            setAvatarError(null);
          } else {
            setAvatarPreview(null);
            setAvatarError('URL ảnh không hợp lệ hoặc không thể tải');
          }
        }, 1000);

        return () => clearTimeout(timeoutId);
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate avatar URL if provided
      if (formData.avatarUrl.trim()) {
        setValidatingImage(true);
        const isValidImage = await validateImageUrl(formData.avatarUrl.trim());
        setValidatingImage(false);

        if (!isValidImage) {
          // Show popup for invalid image URL
          const shouldRetry = window.confirm(
            'URL ảnh đại diện không hợp lệ hoặc không thể tải được.\n\n' +
              'Vui lòng kiểm tra lại URL và đảm bảo:\n' +
              '• URL có định dạng đúng (http:// hoặc https://)\n' +
              '• Ảnh tồn tại và có thể truy cập\n' +
              '• Định dạng ảnh được hỗ trợ (JPG, PNG, GIF, WebP)\n\n' +
              'Bạn có muốn nhập lại URL không?',
          );

          if (shouldRetry) {
            // Focus back to avatar URL input
            const avatarInput = document.getElementById('avatarUrl') as HTMLInputElement;
            if (avatarInput) {
              avatarInput.focus();
              avatarInput.select();
            }
            return;
          } else {
            // User chose to continue without avatar
            setFormData((prev) => ({ ...prev, avatarUrl: '' }));
          }
        }
      }

      const updateData: UpdateProfileDto = {
        fullName: formData.fullName.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        avatarUrl: formData.avatarUrl.trim() || undefined,
      };

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof UpdateProfileDto] === undefined) {
          delete updateData[key as keyof UpdateProfileDto];
        }
      });

      const updatedProfile = await updateCurrentUser(updateData);
      setProfile(updatedProfile);
      setEditing(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật thông tin';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
      setValidatingImage(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
    setEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const validateImageUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!url.trim()) {
        resolve(true); // Empty URL is valid (will show default avatar)
        return;
      }

      // Check if it's a data URL
      if (url.startsWith('data:image/')) {
        // For data URLs, just check if it's a valid data URL format
        const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/i;
        resolve(dataUrlPattern.test(url));
        return;
      }

      // Basic URL format validation for HTTP URLs
      try {
        const urlObj = new URL(url);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          resolve(false);
          return;
        }
      } catch {
        resolve(false);
        return;
      }

      // Test if image can be loaded
      const img = new window.Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;

      // Timeout after 10 seconds
      setTimeout(() => resolve(false), 10000);
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Truy cập bị từ chối</h2>
            <p className="text-gray-600 mb-6">Vui lòng đăng nhập để xem thông tin cá nhân.</p>
            <Button onClick={() => (window.location.href = '/login')} className="w-full">
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thông tin</h2>
            <p className="text-gray-600">Không thể tải thông tin cá nhân của bạn.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Thông tin cá nhân
                </h1>
                <p className="text-gray-600">
                  Quản lý thông tin tài khoản và cài đặt cá nhân của bạn.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-xl">
              <CardContent className="p-6 text-center">
                {/* Avatar */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-gradient-to-br from-blue-600 to-emerald-600 shadow-lg">
                    {profile.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <div
                    className={`absolute bottom-0 right-1/2 transform translate-x-6 w-6 h-6 rounded-full border-2 border-white ${
                      profile.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  ></div>
                </div>

                {/* Basic Info */}
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {profile.fullName || 'Người dùng ẩn danh'}
                </h2>
                <p className="text-gray-600 mb-4 capitalize">
                  {profile.role.toLowerCase() === 'admin'
                    ? 'Quản trị viên'
                    : profile.role.toLowerCase() === 'user'
                      ? 'Người dùng'
                      : profile.role.toLowerCase()}
                </p>

                {/* Status Badge */}
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    profile.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      profile.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                  ></div>
                  {profile.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                </div>

                {/* Member Since */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Thành viên từ {formatDate(profile.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Thông tin tài khoản
                  </CardTitle>
                  <Button
                    variant={editing ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => (editing ? handleCancel() : setEditing(true))}
                    className="flex items-center gap-2"
                  >
                    {editing ? (
                      <>
                        <X className="h-4 w-4" />
                        Hủy
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-4 w-4" />
                        Chỉnh sửa
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Full Name */}
                <div>
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Họ và tên
                  </Label>
                  {editing ? (
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="h-11 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      placeholder="Nhập họ và tên của bạn"
                    />
                  ) : (
                    <div className="flex items-center h-11 px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                      <User className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{profile.fullName || 'Chưa cập nhật'}</span>
                    </div>
                  )}
                </div>

                {/* Email - Read only */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Địa chỉ email
                  </Label>
                  <div className="flex items-center h-11 px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">{profile.email || 'Chưa cập nhật'}</span>
                    <span className="ml-auto text-xs text-gray-500">(Không thể thay đổi)</span>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                    Số điện thoại
                  </Label>
                  {editing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="h-11 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <div className="flex items-center h-11 px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{profile.phone || 'Chưa cập nhật'}</span>
                    </div>
                  )}
                </div>

                {/* Avatar URL */}
                <div>
                  <Label
                    htmlFor="avatarUrl"
                    className="text-sm font-medium text-gray-700 mb-3 block"
                  >
                    Ảnh đại diện
                  </Label>
                  {editing ? (
                    <div className="space-y-3">
                      {/* Avatar Preview Section */}
                      <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {avatarPreview ? (
                            <Image
                              src={avatarPreview}
                              alt="Preview"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            Xem trước ảnh đại diện
                          </p>
                          <p className="text-xs text-gray-600">
                            {avatarPreview ? 'Ảnh sẽ hiển thị như này' : 'Nhập URL để xem trước'}
                          </p>
                        </div>
                      </div>

                      {/* URL Input */}
                      <div>
                        <Input
                          id="avatarUrl"
                          type="text"
                          value={formData.avatarUrl}
                          onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                          className={`h-11 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 ${
                            avatarError
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                              : avatarPreview
                                ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                                : ''
                          }`}
                          placeholder="Dán URL ảnh hoặc chọn file..."
                        />

                        {/* Status indicators */}
                        <div className="mt-2">
                          {avatarError && (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                              <X className="h-4 w-4" />
                              <span>{avatarError}</span>
                            </div>
                          )}

                          {avatarPreview && !avatarError && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>URL ảnh hợp lệ</span>
                            </div>
                          )}

                          {!formData.avatarUrl.trim() && (
                            <p className="text-xs text-gray-500">
                              Hỗ trợ: HTTPS URLs hoặc Data URLs (base64)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Current Avatar Display */}
                      <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {profile.avatarUrl ? (
                            <Image
                              src={profile.avatarUrl}
                              alt="Current Avatar"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            Ảnh đại diện hiện tại
                          </p>
                          <p className="text-xs text-gray-600 break-all">
                            {profile.avatarUrl
                              ? 'Đã thiết lập ảnh đại diện'
                              : 'Chưa có ảnh đại diện'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Role */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Vai trò tài khoản
                  </Label>
                  <div className="flex items-center h-11 px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                    <Shield className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {profile.role.toLowerCase() === 'admin'
                        ? 'Quản trị viên'
                        : profile.role.toLowerCase() === 'user'
                          ? 'Người dùng'
                          : profile.role.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Account ID */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Mã tài khoản
                  </Label>
                  <div className="flex items-center h-11 px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                    <span className="text-gray-900 font-mono text-sm">{profile.id.toString()}</span>
                  </div>
                </div>

                {/* Save Button */}
                {editing && (
                  <div className="pt-4 border-t border-gray-100">
                    <Button
                      onClick={handleSave}
                      disabled={saving || validatingImage}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white flex items-center justify-center gap-2"
                    >
                      {validatingImage ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang kiểm tra ảnh...
                        </>
                      ) : saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Lưu thay đổi
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Last Updated */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 text-center">
                    Cập nhật lần cuối: {formatDate(profile.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
