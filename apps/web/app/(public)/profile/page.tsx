'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { getCurrentUser, updateCurrentAccount, UpdateProfileDto } from '@/lib/api/accountApi';
import { Account } from '@/types/account';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserSidebar } from '@/components/navbar/UserSidebar';
import { AvatarChangeDialog } from './_components/AvatarChangeDialog';

export default function ProfilePage() {
  const { isLoggedIn, user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  // local form state (avatarUrl is now fed by AvatarUploader on success)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    avatarUrl: '',
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
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
        if (!String(errorMessage).includes('hết hạn')) {
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUploaded = async (url: string) => {
    // cập nhật local UI ngay
    setFormData((prev) => ({ ...prev, avatarUrl: url }));
    setProfile((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
    
    // ⭐ CRITICAL: Refresh auth context to update navbar avatar
    await refreshUser();
    
    toast.success('Tải ảnh đại diện thành công');
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updateData: UpdateProfileDto = {
        fullName: formData.fullName.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        avatarUrl: formData.avatarUrl.trim() || undefined, // set by AvatarUploader
      };

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if ((updateData as any)[key] === undefined) delete (updateData as any)[key];
      });

      const updatedProfile = await updateCurrentAccount(updateData);
      setProfile(updatedProfile);
      setEditing(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật thông tin';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
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
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[#048C73] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Truy cập bị từ chối</h2>
            <p className="text-gray-600 mb-6">Vui lòng đăng nhập để xem thông tin cá nhân.</p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-[#048C73] hover:bg-[#037A66]"
            >
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
          <div className="w-8 h-8 border-2 border-[#048C73] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-xl">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-xl">
              <CardContent className="p-6 text-center">
                {/* Avatar */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-[#048C73] shadow-lg overflow-hidden">
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

                  {/* Floating change-avatar button (bottom-right) */}
                  <button
                    type="button"
                    onClick={() => setAvatarDialogOpen(true)}
                    className="absolute -bottom-2 right-1/2 translate-x-10 p-2 border-2 border-white cursor-pointer rounded-full bg-zinc-100"
                    aria-label="Đổi ảnh đại diện"
                  >
                    <Camera className="h-3 w-3 text-gray-600" />
                  </button>
                </div>

                {/* Basic Info */}
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {profile.fullName || 'Người dùng ẩn danh'}
                </h2>

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
                      className="h-11 border-gray-300 focus:border-[#048C73] focus:ring-2 focus:ring-[#048C73]/20"
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
                      className="h-11 border-gray-300 focus:border-[#048C73] focus:ring-2 focus:ring-[#048C73]/20"
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <div className="flex items-center h-11 px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{profile.phone || 'Chưa cập nhật'}</span>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                {editing && (
                  <div className="pt-4 border-t border-gray-100">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full bg-[#048C73] hover:bg-[#037A66] disabled:bg-[#048C73]/60 text-white flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      {/* Avatar Dialog */}
      <AvatarChangeDialog
        open={avatarDialogOpen}
        onOpenChange={setAvatarDialogOpen}
        initialUrl={profile.avatarUrl}
        onUploaded={handleAvatarUploaded}
      />

      {/* UserSidebar */}
      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={logout}
      />
    </div>
  );
}
