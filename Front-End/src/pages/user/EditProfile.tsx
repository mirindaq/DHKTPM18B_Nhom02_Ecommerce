import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera, Save, User, Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";
import { customerService } from "@/services/customer.service";
import { uploadService } from "@/services/upload.service";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { USER_PATH } from "@/constants/path";

interface ProfileData {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  avatar: string;
}

export default function EditProfile() {
  const navigate = useNavigate();
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
      navigate(USER_PATH.PROFILE);
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(USER_PATH.PROFILE)}
              >
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-xl font-semibold">Chỉnh sửa thông tin</h1>
            </div>
            <Button
              className="bg-red-600 hover:bg-red-700 gap-2"
              onClick={handleSave}
              disabled={saving || uploading}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Lưu
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-gray-100">
                  {profileData.avatar ? (
                    <AvatarImage src={profileData.avatar} alt="Avatar" />
                  ) : (
                    <AvatarFallback className="bg-red-100 text-red-600">
                      <User size={40} />
                    </AvatarFallback>
                  )}
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                  onClick={handleAvatarClick}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Camera size={14} />
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
              <p className="text-sm text-gray-500">
                Nhấn vào biểu tượng camera để thay đổi ảnh đại diện
              </p>
            </div>

            {/* Form Fields */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  placeholder="Nhập họ và tên"
                  value={profileData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  placeholder="Nhập số điện thoại"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
