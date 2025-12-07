import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DatePicker } from "@/components/ui/date-picker";
import { Camera, Save, User, Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";
import { customerService } from "@/services/customer.service";
import { uploadService } from "@/services/upload.service";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

interface ProfileData {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  avatar: string;
}

export default function EditProfile() {
  const { refreshProfile } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    id: 0,
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    avatar: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await authService.getProfile();
        const data = res.data?.data || res.data;
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const profileInfo = data as any;
          setProfileData({
            id: profileInfo.id,
            fullName: profileInfo.fullName || "",
            email: profileInfo.email || "",
            phone: profileInfo.phone || "",
            dateOfBirth: profileInfo.dateOfBirth || "",
            avatar: profileInfo.avatar || "",
          });
        }
      } catch (error) {
        console.error("Lỗi load profile:", error);
        toast.error("Không thể tải thông tin cá nhân");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file tối đa 5MB");
      return;
    }

    try {
      setUploading(true);

      const response = await uploadService.uploadImage([file]);

      if (response.data && response.data.length > 0) {
        setProfileData((prev) => ({ ...prev, avatar: response.data[0] }));
        toast.success("Tải ảnh lên thành công!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Không thể tải ảnh lên");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profileData.fullName.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }

    try {
      setSaving(true);
      await customerService.updateCustomer(profileData.id, {
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
        avatar: profileData.avatar,
      });
      // Refresh user context để cập nhật thông tin trên header
      await refreshProfile();
      toast.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header với nút lưu */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Thông tin tài khoản
        </h2>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={handleSave}
          disabled={saving || uploading || loading}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-4" />
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b">
                <div className="relative">
                  <Avatar className="w-28 h-28 border-4 border-gray-200 shadow-md">
                    {profileData.avatar ? (
                      <AvatarImage 
                        src={profileData.avatar} 
                        alt="Avatar"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-red-100 to-pink-100 text-red-600 text-3xl">
                      <User size={48} />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full h-10 w-10 bg-white hover:bg-gray-100 border-2 border-gray-200 shadow-md"
                    onClick={handleAvatarClick}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 size={16} className="animate-spin text-gray-600" />
                    ) : (
                      <Camera size={16} className="text-gray-700" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Nhấn vào biểu tượng camera để thay đổi ảnh đại diện
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Nhập họ và tên"
                    value={profileData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email"
                    value={profileData.email}
                    disabled
                    className="bg-gray-100 cursor-not-allowed text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Số điện thoại
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Nhập số điện thoại"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                    Ngày sinh
                  </Label>
                  <DatePicker
                    id="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={(value) =>
                      handleInputChange("dateOfBirth", value)
                    }
                    placeholder="Chọn ngày sinh"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
