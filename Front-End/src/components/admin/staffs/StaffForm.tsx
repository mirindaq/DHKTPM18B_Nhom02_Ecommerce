// src/components/admin/staffs/StaffForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  CreateStaffRequest,
  UpdateStaffRequest,
  Staff,
  UserRole,
  WorkStatus,
} from "@/types/staff.type";
import { DatePicker } from "@/components/ui/date-picker";
import { uploadService } from "@/services/upload.service";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";

interface StaffFormProps {
  staff: Staff | null;
  roles: UserRole[];
  onSubmit: (data: CreateStaffRequest | UpdateStaffRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
  isEdit?: boolean;
}

const getInitialFormData = (
  staff: Staff | null
): CreateStaffRequest & Partial<UpdateStaffRequest> => {
  if (staff) {
    return {
      fullName: staff.fullName ?? "",
      email: staff.email ?? "",
      phone: staff.phone ?? "",
      address: staff.address ?? "",
      dateOfBirth: staff.dateOfBirth ?? "",
      joinDate: staff.joinDate ?? "",
      workStatus: staff.workStatus ?? "ACTIVE",
      roleIds: staff.userRole?.map((ur) => ur.role.id) || [],
      avatar: staff.avatar ?? "",
      password: "",
      active: staff.active ?? true,
    };
  }

  return {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    dateOfBirth: "",
    joinDate: "",
    workStatus: "ACTIVE",
    roleIds: [],
    avatar: "",
    active: true,
  };
};

export default function StaffForm({
  staff,
  roles,
  onSubmit,
  onCancel,
  isLoading,
  isEdit = false,
}: StaffFormProps) {
  const [formData, setFormData] = useState(() => getInitialFormData(staff));
  const [preview, setPreview] = useState<string | null>(staff?.avatar || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const validateForm = (formData: any, isEdit: boolean): boolean => {
    if (!formData.fullName.trim()) {
      toast.error("Họ và tên không được để trống");
      return false;
    }

    if (!isEdit) {
      if (!formData.email.trim()) {
        toast.error("Email không được để trống");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Email không đúng định dạng");
        return false;
      }

      if (!formData.password.trim()) {
        toast.error("Mật khẩu không được để trống");
        return false;
      }
    }

    if (!formData.phone.trim()) {
      toast.error("Số điện thoại không được để trống");
      return false;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Số điện thoại phải gồm đúng 10 chữ số");
      return false;
    }

    if (!formData.dateOfBirth) {
      toast.error("Vui lòng chọn ngày sinh");
      return false;
    }

    if (!formData.joinDate) {
      toast.error("Vui lòng chọn ngày vào làm");
      return false;
    }

    if (!formData.roleIds || formData.roleIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một vai trò");
      return false;
    }

    return true;
  };

  const handleValueChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData, isEdit)) {
      return;
    }

    let finalAvatarUrl = staff?.avatar || "";
    if (selectedFile) {
      setIsUploading(true);
      try {
        const uploadResponse = await uploadService.uploadImage([selectedFile]);
        finalAvatarUrl = uploadResponse.data[0];
      } catch (error) {
        toast.error("Upload ảnh đại diện thất bại.");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // Nếu chưa có avatar thì gán avatar mặc định
    if (!finalAvatarUrl) {
      finalAvatarUrl = "/assets/avatar.jpg";
    }

    if (isEdit && staff) {
      const payload: UpdateStaffRequest = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        avatar: finalAvatarUrl,
        dateOfBirth: formData.dateOfBirth,
        joinDate: formData.joinDate,
        workStatus: formData.workStatus as WorkStatus,
        roleIds: formData.roleIds,
      };
      onSubmit(payload);
    } else {
      const payload: CreateStaffRequest = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password!,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        joinDate: formData.joinDate,
        workStatus: formData.workStatus as WorkStatus,
        roleIds: formData.roleIds,
        avatar: finalAvatarUrl,
        active: true,
      };
      onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <img
            src={preview ?? "/assets/avatar.jpg"}
            alt="Avatar"
            className="h-28 w-28 rounded-full object-cover border-2"
          />

          <label
            htmlFor="staff-image-upload"
            className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-700"
          >
            <Camera className="h-4 w-4 text-white" />
          </label>
          <input
            id="staff-image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading || isUploading}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Họ và tên *</Label>
          <Input
            defaultValue={formData.fullName}
            onChange={(e) => handleValueChange("fullName", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>Số điện thoại *</Label>
          <Input
            defaultValue={formData.phone}
            onChange={(e) => handleValueChange("phone", e.target.value)}
          />
        </div>

        {!isEdit && (
          <>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input
                defaultValue={formData.email}
                onChange={(e) => handleValueChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Mật khẩu *</Label>
              <Input
                type="password"
                onChange={(e) => handleValueChange("password", e.target.value)}
              />
            </div>
          </>
        )}

        <div className="space-y-1">
          <Label>Địa chỉ</Label>
          <Input
            defaultValue={formData.address}
            onChange={(e) => handleValueChange("address", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>Ngày sinh</Label>
          <DatePicker
            id="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={(val) => handleValueChange("dateOfBirth", val)}
          />
        </div>

        <div className="space-y-1">
          <Label>Ngày vào làm</Label>
          <DatePicker
            id="joinDate"
            value={formData.joinDate}
            onChange={(val) => handleValueChange("joinDate", val)}
          />
        </div>

        <div className="space-y-1">
          <Label>Trạng thái làm việc</Label>
          <Select
            defaultValue={formData.workStatus}
            onValueChange={(value: WorkStatus) =>
              handleValueChange("workStatus", value)
            }
          >
            <SelectTrigger className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500 w-full">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Đang làm</SelectItem>
              <SelectItem value="INACTIVE">Nghỉ việc</SelectItem>
              <SelectItem value="PROBATION">Thử việc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 md:col-span-2">
          <Label>Vai trò</Label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((role) => (
              <label key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={(formData.roleIds || []).includes(role.id)}
                  onCheckedChange={(checked) =>
                    handleValueChange(
                      "roleIds",
                      checked
                        ? [...(formData.roleIds || []), role.id]
                        : (formData.roleIds || []).filter(
                            (id) => id !== role.id
                          )
                    )
                  }
                />
                <span>{role.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || isUploading}
        >
          Thoát
        </Button>

        <Button type="submit" disabled={isLoading || isUploading}>
          {isLoading || isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý...
            </>
          ) : staff ? (
            "Cập nhật"
          ) : (
            "Tạo nhân viên"
          )}
        </Button>
      </div>
    </form>
  );
}
