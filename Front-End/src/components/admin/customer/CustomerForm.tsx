// src/components/admin/customer/CustomerForm.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Camera, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { CustomerSummary, CreateCustomerRequest, UpdateCustomerProfileRequest } from "@/types/customer.type";
import { uploadService } from "@/services/upload.service";

interface CustomerFormProps {
  customer: CustomerSummary | null;
  onSubmit: (data: CreateCustomerRequest | UpdateCustomerProfileRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const getInitialFormData = (customer: CustomerSummary | null) => {
  if (customer) {
    return {
      fullName: customer.fullName ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      address: customer.address ?? "",
      dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth) : null,
      avatar: customer.avatar ?? "",
      password: "",
      registerDate: customer.registerDate ? new Date(customer.registerDate) : new Date(),
    };
  }

  return {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    registerDate: new Date(),
    address: "",
    dateOfBirth: null,
    gender: undefined,
    avatar: "",
  };
};

export default function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isLoading,
}: CustomerFormProps) {
  const [formData, setFormData] = useState(() => getInitialFormData(customer));
  const [preview, setPreview] = useState(() => customer?.avatar || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData, !!customer)) {
      return;
    }

    let finalAvatarUrl = customer?.avatar || "";
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

    const formattedDateOfBirth = formData.dateOfBirth
      ? format(formData.dateOfBirth, "yyyy-MM-dd")
      : null;

    if (customer) {
      const payload: UpdateCustomerProfileRequest = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formattedDateOfBirth,
        avatar: finalAvatarUrl,
      };
      onSubmit(payload);
    } else {
      const payload: CreateCustomerRequest = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password!,
        registerDate: formData.registerDate || new Date(),
        address: formData.address,
        dateOfBirth: formattedDateOfBirth,
        avatar: finalAvatarUrl,
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
            htmlFor="customer-image-upload"
            className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-700"
          >
            <Camera className="h-4 w-4 text-white" />
          </label>
          <input
            id="customer-image-upload"
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

        {!customer && (
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dateOfBirth
                  ? format(formData.dateOfBirth, "dd/MM/yyyy")
                  : "Chọn ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.dateOfBirth || undefined}
                onSelect={(date) => handleValueChange("dateOfBirth", date)}
              />
            </PopoverContent>
          </Popover>
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
          ) : customer ? (
            "Cập nhật"
          ) : (
            "Tạo khách hàng"
          )}
        </Button>
      </div>
    </form>
  );
}
