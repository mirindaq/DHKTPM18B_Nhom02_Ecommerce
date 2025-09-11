// src/components/admin/staffs/StaffForm.tsx
import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";

interface StaffFormProps {
  staff?: Staff | null;
  roles: UserRole[];
  onSubmit: (data: CreateStaffRequest | UpdateStaffRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
  open: boolean;
}

function mapWorkStatusToApi(value: WorkStatus) {
  switch (value) {
    case "ACTIVE":
      return "ACTIVE"; // hoặc "1"
    case "INACTIVE":
      return "INACTIVE"; // hoặc "0"
    case "PROBATION":
      return "PROBATION";
  }
}

export default function StaffForm({
  staff,
  roles,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}: StaffFormProps) {
  console.log("StaffForm mounted with staff:", staff);
  const [formData, setFormData] = useState<CreateStaffRequest>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    avatar: "",
    dateOfBirth: "",
    active: true,
    joinDate: "",
    workStatus: "ACTIVE", // 🔥 quan trọng
    roleIds: [],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!open) {
      // dialog closed -> we can safely reset (optional)
      if (!isEdit) {
        setFormData({
          fullName: "",
          email: "",
          password: "",
          phone: "",
          address: "",
          avatar: "",
          dateOfBirth: "",
          active: true,
          joinDate: "",
          workStatus: "ACTIVE",
          roleIds: [],
        });
        setPreviewUrl("");
      }
      return;
    }

    // dialog opened -> initialize from staff (if exists) or defaults
    if (staff) {
      setFormData({
        fullName: staff.fullName || "",
        email: staff.email || "",
        password: "",
        phone: staff.phone || "",
        address: staff.address || "",
        avatar: staff.avatar || "",
        dateOfBirth: staff.dateOfBirth || "",
        active: staff.active ?? true,
        joinDate: staff.joinDate || "",
        workStatus: staff.workStatus
          ? (String(staff.workStatus).toUpperCase().trim() as WorkStatus)
          : "ACTIVE",
        roleIds: staff.userRole?.map((ur) => ur.role.id) || [],
      });
      setPreviewUrl(staff.avatar || "");
    } else {
      // opened for "create new"
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        avatar: "",
        dateOfBirth: "",
        active: true,
        joinDate: "",
        workStatus: "ACTIVE",
        roleIds: [],
      });
      setPreviewUrl("");
    }
  }, [open, staff, isEdit]);

  const handleChange = (
    field: keyof CreateStaffRequest | keyof UpdateStaffRequest,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    setFormData((prev) => {
      const roleIds = checked
        ? [...(prev.roleIds || []), roleId]
        : (prev.roleIds || []).filter((id) => id !== roleId);
      return { ...prev, roleIds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let finalAvatarUrl = formData.avatar;

      // ✅ Xử lý upload avatar nếu có file mới
      if (selectedFile) {
        setIsUploading(true);
        const uploadResponse = await uploadService.uploadImage([selectedFile]);
        if (uploadResponse.data && uploadResponse.data.length > 0) {
          finalAvatarUrl = uploadResponse.data[0];
        } else {
          toast.error("Không thể upload hình ảnh");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      if (isEdit) {
        // ✅ Update staff
        const updateData: UpdateStaffRequest = {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          avatar: finalAvatarUrl,
          dateOfBirth: formData.dateOfBirth,
          joinDate: formData.joinDate,
          workStatus: mapWorkStatusToApi(formData.workStatus ?? "ACTIVE"), // map lại trước khi gọi API
          // roleIds: formData.roleIds,
        };
        console.log("updateData >>>", updateData);
        onSubmit(updateData);
      } else {
        // ✅ Create staff
        const createData: CreateStaffRequest = {
          ...formData,
          avatar: finalAvatarUrl,
          workStatus: mapWorkStatusToApi(formData.workStatus ?? "ACTIVE"), // map lại trước khi gọi API
        };
        console.log("createData >>>", createData);
        onSubmit(createData);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Có lỗi xảy ra khi upload hình ảnh");
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, avatar: "" }));
  };
  console.log("formData.workStatus >>>", formData.workStatus);
  console.log("Select value >>>", JSON.stringify(formData.workStatus));
  console.log("Render Select với value:", formData.workStatus);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Họ và tên */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          htmlFor="fullName"
          className="text-right font-medium text-gray-700"
        >
          Họ và tên <span className="text-red-500">*</span>
        </Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Họ và tên"
          required
        />
      </div>

      {/* Số điện thoại */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="phone" className="text-right font-medium text-gray-700">
          Số điện thoại <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Số điện thoại"
          required
        />
      </div>

      {/* Email + Password */}
      {!isEdit && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right font-medium text-gray-700">
            Tài khoản <span className="text-red-500">*</span>
          </Label>
          <div className="col-span-3 grid grid-cols-2 gap-4">
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              placeholder="Email"
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
              placeholder="Mật khẩu"
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Địa chỉ */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          htmlFor="address"
          className="text-right font-medium text-gray-700"
        >
          Địa chỉ
        </Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className="col-span-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Địa chỉ"
        />
      </div>

      {/* Ngày sinh + Ngày vào làm */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right font-medium text-gray-700">
          Thời gian
        </Label>
        <div className="col-span-3 grid grid-cols-2 gap-4">
          <DatePicker
            id="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={(val) => handleChange("dateOfBirth", val)}
            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
          <DatePicker
            id="joinDate"
            value={formData.joinDate}
            onChange={(val) => handleChange("joinDate", val)}
            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Trạng thái làm việc */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          htmlFor="workStatus"
          className="text-right font-medium text-gray-700"
        >
          Trạng thái làm việc
        </Label>
        <Select
          key={formData.workStatus} // ép Select mount lại khi value đổi
          value={formData.workStatus}
          onValueChange={(v) => handleChange("workStatus", v as WorkStatus)}
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

      {/* Avatar */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right font-medium text-gray-700 pt-2">
          Ảnh đại diện
        </Label>
        <div className="col-span-3 space-y-3">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
          {previewUrl && (
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeImage}
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 text-white hover:bg-red-600 border-0"
              >
                X
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Vai trò */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right font-medium text-gray-700">Vai trò</Label>
        <div className="col-span-3 grid grid-cols-2 gap-2">
          {roles.map((role) => (
            <label key={role.id} className="flex items-center space-x-2">
              <Checkbox
                checked={(formData.roleIds || []).includes(role.id)}
                onCheckedChange={(checked) =>
                  handleRoleChange(role.id, checked === true)
                }
              />
              <span>{role.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading || isUploading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading || isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : staff ? (
            "Cập nhật"
          ) : (
            "Thêm"
          )}
        </Button>
      </div>
    </form>
  );
}
