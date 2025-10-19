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
      
      // ✅ Thêm wardCode và provinceCode vào nhánh này
      wardCode: "", 
      provinceCode: "", // THÊM VÀO ĐÂY
    };
  }

  return {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    
    address: "",
    wardCode: "",
    provinceCode: "", // Đã có ở đây
    dateOfBirth: null,
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

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!validateForm(formData, !!customer)) {
  //     return;
  //   }

  //   let finalAvatarUrl = customer?.avatar || "";
  //   if (selectedFile) {
  //     setIsUploading(true);
  //     try {
  //       const uploadResponse = await uploadService.uploadImage([selectedFile]);
  //       finalAvatarUrl = uploadResponse.data[0];
  //     } catch (error) {
  //       toast.error("Upload ảnh đại diện thất bại.");
  //       setIsUploading(false);
  //       return;
  //     } finally {
  //       setIsUploading(false);
  //     }
  //   }

  //   // Nếu chưa có avatar thì gán avatar mặc định
  //   if (!finalAvatarUrl) {
  //     finalAvatarUrl = "/assets/avatar.jpg";
  //   }

  //   const formattedDateOfBirth = formData.dateOfBirth
  //     ? format(formData.dateOfBirth, "yyyy-MM-dd")
  //     : null;

  //   if (customer) {
  //     const payload: UpdateCustomerProfileRequest = {
  //       fullName: formData.fullName,
  //       email: formData.email,
  //       phone: formData.phone,
  //       address: formData.address,
  //       dateOfBirth: formattedDateOfBirth,
  //       avatar: finalAvatarUrl,
  //     };
  //     onSubmit(payload);
  //   } else {
  //     const payload: CreateCustomerRequest = {
  //       fullName: formData.fullName,
  //       email: formData.email,
  //       phone: formData.phone,
  //       password: formData.password!,
  //       registerDate: formData.registerDate || new Date(),
  //       address: {
  //         subAddress: formData.address,
  //         wardCode: formData.wardCode,
  //         provinceCode: formData.provinceCode,
  //       },
  //       dateOfBirth: formattedDateOfBirth,
  //       avatar: finalAvatarUrl,
  //     };
      
  //     onSubmit(payload);
  //   }
  // };

// ... (các hàm khác)

// Thay thế hàm handleSubmit hiện tại bằng đoạn này
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // A. IN DỮ LIỆU FORM HIỆN TẠI VÀO CONSOLE
  console.log("=========================================");
  console.log("1. Dữ liệu Form hiện tại (formData):", formData);
  console.log("2. Selected File:", selectedFile);
  console.log("=========================================");

  // B. CHẠY VÀ IN KẾT QUẢ VALIDATION
  const isEdit = !!customer;
  const isValid = validateForm(formData, isEdit);
  console.log("3. Kết quả Validation (isValid):", isValid);

  if (!isValid) {
      // Validation thất bại, form đã bị chặn. Lỗi đã được toast.error hiển thị.
      console.log("4. THẤT BẠI: Validation không hợp lệ. Vui lòng kiểm tra các toast error.");
      return;
  }

  // Nếu validation thành công, tiếp tục logic upload
  console.log("4. THÀNH CÔNG: Validation hợp lệ. Tiếp tục xử lý...");

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
    // Logic cập nhật (không xảy ra khi tạo mới)
    // ...
  } else {
    // C. TẠO PAYLOAD VÀ IN RA CONSOLE
    const payload: CreateCustomerRequest = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password!, // Lưu ý: Dùng `!` có thể ẩn lỗi nếu password là chuỗi rỗng
      
      address: {
        subAddress: formData.address,
        wardCode: formData.wardCode ?? "", // Đảm bảo không phải undefined
        provinceCode: formData.provinceCode ?? "",
      },
      dateOfBirth: formattedDateOfBirth,
      avatar: finalAvatarUrl,
    };
    
    console.log("5. Payload sẽ được gửi (CreateCustomerRequest):", payload);
    onSubmit(payload);
  }
};

// ... (phần return JSX)


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
{/* Thêm trường Tỉnh/Thành phố (Province) */}
<div className="space-y-1">
    <Label>Tỉnh/Thành phố</Label>
    <select
        className="border border-gray-300 rounded-md w-full p-2"
        value={formData.provinceCode || ""}
        onChange={(e) => handleValueChange("provinceCode", e.target.value)}
    >
        <option value="">-- Chọn Tỉnh/Thành phố --</option>
        <option value="HCM">Hồ Chí Minh</option>
        <option value="HN">Hà Nội</option>
        <option value="DN">Đà Nẵng</option>
    </select>
</div>

<div className="space-y-1">
    <Label>Phường/Xã</Label>
    <select
        className="border border-gray-300 rounded-md w-full p-2"
        value={formData.wardCode || ""}
        onChange={(e) => {
            const selectedWardCode = e.target.value;
            handleValueChange("wardCode", selectedWardCode);

            // 💡 LOGIC: Tự động set provinceCode dựa trên wardCode đã chọn
            let newProvinceCode = "";
            switch (selectedWardCode) {
                case "P1HCM":
                case "P7HCM":
                    newProvinceCode = "HCM";
                    break;
                case "P2HN":
                    newProvinceCode = "HN";
                    break;
                case "P5DN":
                    newProvinceCode = "DN";
                    break;
                default:
                    newProvinceCode = "";
            }
            handleValueChange("provinceCode", newProvinceCode);
        }} 
    >
        <option value="">-- Chọn Phường/Xã --</option>
        
        {/* ✅ Dữ liệu từ bảng Wards của bạn */}
        <option value="P1HCM">Phường 1 (HCM)</option> 
        <option value="P2HN">Phường Tràng Tiền (HN)</option>
        <option value="P5DN">Phường Hải Châu 1 (DN)</option>
        <option value="P7HCM">Phường 7 (HCM)</option>
        
    </select>
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
