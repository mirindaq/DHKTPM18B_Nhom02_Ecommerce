// src/components/admin/customer/CustomerForm.tsx
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, ArrowLeft, Plus } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import type {
  CustomerSummary,
  CreateCustomerRequest,
  UpdateCustomerProfileRequest,
  AddressRequest,
  AddressResponse,
} from "@/types/customer.type";
import { customerService } from "@/services/customer.service";
import { provinceService } from "@/services/province.service";
import AddressFields from "./AddressFields";

interface AddressFormData {
  id: number;
  customerId?: number;
  subAddress: string;
  wardCode: string;
  provinceCode: string;
  fullName: string;
  phone: string;
  isDefault: boolean;
  addressName: string;
}

const getInitialFormData = (customer: CustomerSummary | null) => {
  if (customer) {
    return {
      fullName: customer.fullName ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      dateOfBirth: customer.dateOfBirth ?? "",
      avatar: customer.avatar ?? "",
      password: "",
    };
  }
  return {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    dateOfBirth: "",
    avatar: "",
  };
};

const getNewAddress = (index: number, name: string, phone: string): AddressFormData => ({
  id: index,
  subAddress: "",
  wardCode: "",
  provinceCode: "",
  fullName: name,
  phone: phone,
  isDefault: index === 0,
  addressName: index === 0 ? "Địa chỉ mặc định" : "",
});

const mapAddressResponseToFormData = (addr: AddressResponse, index: number): AddressFormData => {
  const rawAddr = addr as any;
  const realId = rawAddr.id ?? index;
  const customerId = rawAddr.customerId ?? rawAddr.customer_id ?? rawAddr.customer?.id ?? undefined;

  const wardId = rawAddr.wardId?.toString() || "";
  const provinceId = rawAddr.provinceId?.toString() || "";

  return {
    id: realId,
    subAddress: addr.subAddress || "",
    wardCode: wardId, 
    provinceCode: provinceId, 
    fullName: addr.fullName || "",
    phone: addr.phone || "",
    isDefault: rawAddr.isDefault || false,
    addressName: rawAddr.addressName || "",
    customerId,
  };
};

interface CustomerFormProps {
  customer: CustomerSummary | null;
  onSubmit: (data: CreateCustomerRequest | UpdateCustomerProfileRequest) => Promise<void>;
  onFinished: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function CustomerForm({
  customer,
  onSubmit,
  onFinished,
  onCancel,
  isLoading,
}: CustomerFormProps) {
  const [formData, setFormData] = useState(() => getInitialFormData(customer));
  const [preview, setPreview] = useState(() => customer?.avatar || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [createdCustomer, setCreatedCustomer] = useState<CustomerSummary | null>(customer);

const [deletedAddressIds, setDeletedAddressIds] = useState<number[]>([]);

 
  const [addresses, setAddresses] = useState<AddressFormData[]>(() => {
    if (customer && customer.addresses && customer.addresses.length > 0) {
      return customer.addresses.map((addr, idx) => ({
        ...mapAddressResponseToFormData(addr, idx),
        // nếu backend trả customer id thì map đã gán; vẫn gán lại để chắc chắn
        customerId: customer.id,
      }));
    }
    if (customer) {
      return [getNewAddress(0, customer.fullName || "", customer.phone || "")];
    }
    return [getNewAddress(0, "", "")];
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [wardsByProvince, setWardsByProvince] = useState<Record<string, any[]>>({});
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  const nextAddressId = useMemo(
    () => (addresses.length ? addresses[addresses.length - 1].id + 1 : 0),
    [addresses]
  );

  const normalize = (s?: string) =>
    (!s ? "" : s.normalize?.("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim());

  useEffect(() => {
    if (step === 2 || customer) {
      const fetchProvinces = async () => {
        try {
          setIsAddressLoading(true);
          const data = await provinceService.getAllProvinces();
          setProvinces(data || []);
        } catch (err) {
          console.error("fetchProvinces error:", err);
          toast.error("Không tải được danh sách tỉnh/thành");
        } finally {
          setIsAddressLoading(false);
        }
      };
      fetchProvinces();
    }
  }, [step, customer]);

  useEffect(() => {
    if (!customer) return;
    if (!provinces.length) return;
    if (!addresses.length) return;

    // Load wards for all provinces that have addresses
    const provinceIdsToFetch = Array.from(
      new Set(
        addresses
          .map((a) => a.provinceCode)
          .filter((c) => !!c && !wardsByProvince[c])
      )
    );

    if (provinceIdsToFetch.length === 0) return;

    const fetchWards = async () => {
      const newWardsMap: Record<string, any[]> = {};
      for (const provinceIdStr of provinceIdsToFetch) {
        try {
          const wards = await provinceService.getWardsByProvince(Number(provinceIdStr));
          newWardsMap[provinceIdStr] = wards || [];
        } catch (err) {
          console.error("fetch ward error", err);
          newWardsMap[provinceIdStr] = [];
        }
      }
      setWardsByProvince((prev) => ({ ...prev, ...newWardsMap }));
    };

    fetchWards();
  }, [customer, provinces, addresses.length]); // run when provinces available and addresses are set

  const handleValueChange = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleAddressChange = (index: number, field: keyof AddressFormData, value: any) => {
    setAddresses((prev) =>
      prev.map((addr, i) => {
        if (field === "isDefault" && value) {
          return { ...addr, isDefault: i === index }; // chỉ index này true
        }
        if (i === index) {
          return { ...addr, [field]: value };
        }
        return addr;
      })
    );
  };
  

  const handleProvinceChange = async (index: number, provinceIdStr: string) => {
    handleAddressChange(index, "provinceCode", provinceIdStr);
    handleAddressChange(index, "wardCode", "");

    if (provinceIdStr && !wardsByProvince[provinceIdStr]) {
      try {
        setIsAddressLoading(true);
        // Convert provinceId string to number for API call
        const data = await provinceService.getWardsByProvince(Number(provinceIdStr));
        setWardsByProvince((prev) => ({ ...prev, [provinceIdStr]: data }));
      } catch (error) {
        console.error("Error loading wards:", error);
        toast.error("Không tải được danh sách phường/xã");
      } finally {
        setIsAddressLoading(false);
      }
    }
  };
  const handleRemoveAddress = (index: number) => {
    const addrToRemove = addresses[index];
    if (addrToRemove.id && addrToRemove.customerId) {
      setDeletedAddressIds(prev => [...prev, addrToRemove.id]);
    }
    setAddresses(prev => prev.filter((_, i) => i !== index));
  };
  
  
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        toast.error("Họ và tên không được để trống");
        return false;
      }
      if (!formData.email.trim()) {
        toast.error("Email không được để trống");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Email không đúng định dạng");
        return false;
      }
      if (!formData.phone.trim()) {
        toast.error("Số điện thoại không được để trống");
        return false;
      }
      if (!customer && !formData.password.trim()) {
        toast.error("Mật khẩu không được để trống");
        return false;
      }
      if (!/^[0-9]{10}$/.test(formData.phone)) {
        toast.error("Số điện thoại phải gồm 10 chữ số");
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (!addresses.length) {
        toast.error("Vui lòng thêm ít nhất một địa chỉ");
        return false;
      }
      let valid = true;
      addresses.forEach((addr, idx) => {
        if (!addr.subAddress.trim()) {
          toast.error(`Địa chỉ ${idx + 1}: chi tiết không được để trống`);
          valid = false;
        }
        if (!addr.wardCode.trim()) {
          toast.error(`Địa chỉ ${idx + 1}: chọn phường/xã`);
          valid = false;
        }
        if (!addr.provinceCode.trim()) {
          toast.error(`Địa chỉ ${idx + 1}: chọn tỉnh/thành`);
          valid = false;
        }
        if (!addr.fullName.trim()) {
          toast.error(`Địa chỉ ${idx + 1}: tên người nhận không được để trống`);
          valid = false;
        }
        if (!/^[0-9]{10}$/.test(addr.phone)) {
          toast.error(`Địa chỉ ${idx + 1}: SĐT không hợp lệ`);
          valid = false;
        }
      });
      if (valid && !addresses.some((addr) => addr.isDefault)) {
        toast.error("Chọn ít nhất 1 địa chỉ mặc định");
        valid = false;
      }
      return valid;
    }
    return true;
  };

  const handleStep1Submit = async () => {
    if (customer) return;
    if (!validateStep(1)) return;
    setIsUploading(true);
    try {
      let finalAvatar = preview || "/assets/avatar.jpg";
      if (selectedFile) {
        await new Promise((r) => setTimeout(r, 500));
        toast.success("Upload avatar thành công (mô phỏng)");
      }
      const dob = formData.dateOfBirth || null;
      const payload: CreateCustomerRequest = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password!,
        avatar: finalAvatar,
        dateOfBirth: dob,
        addresses: [],
      };
      const newCustomer = await customerService.createCustomer(payload);
      setCreatedCustomer(newCustomer.data);
      toast.success("Khách hàng tạo thành công. Tiếp tục thêm địa chỉ.");
      setStep(2);
    } catch (error) {
      console.error(error);
      toast.error("Thao tác thất bại");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer && step === 1) return handleStep1Submit();

  
    if (!validateStep(1)) return;
    if (!validateStep(2)) return;
  
    setIsUploading(true);
    try {
      const targetCustomer = customer || createdCustomer;
  
      if (!targetCustomer) throw new Error("Customer chưa được tạo");
  
      for (const id of deletedAddressIds) {
        await customerService.deleteAddressForCustomer(targetCustomer.id, id);
      }
  
      
      const defaultAddress = addresses.find(a => a.isDefault);
      const nonDefaultAddresses = addresses.filter(a => !a.isDefault);
   
      for (const addr of nonDefaultAddresses) {
      
        let phoneNumber = addr.phone.trim();
        if (!phoneNumber.startsWith('0') && !phoneNumber.startsWith('+84')) {
          phoneNumber = '0' + phoneNumber;
        }
        
        const req = {
          subAddress: addr.subAddress,
          wardId: Number(addr.wardCode),
          fullName: addr.fullName,
          phone: phoneNumber,
          isDefault: false, 
        };
  
        if (addr.id && addr.customerId) {
          await customerService.updateAddress(targetCustomer.id, addr.id, req);
        } else {
          await customerService.createAddressForCustomer(targetCustomer.id, req);
        }
      }
      
    
      if (defaultAddress) {
        let phoneNumber = defaultAddress.phone.trim();
        if (!phoneNumber.startsWith('0') && !phoneNumber.startsWith('+84')) {
          phoneNumber = '0' + phoneNumber;
        }
        
        const req = {
          subAddress: defaultAddress.subAddress,
          wardId: Number(defaultAddress.wardCode),
          fullName: defaultAddress.fullName,
          phone: phoneNumber,
          isDefault: true,
        };
  
        if (defaultAddress.id && defaultAddress.customerId) {
          await customerService.updateAddress(targetCustomer.id, defaultAddress.id, req);
        } else {
          await customerService.createAddressForCustomer(targetCustomer.id, req);
        }
      }
  
      toast.success("Cập nhật địa chỉ thành công");
      onFinished();
    } catch (err) {
      console.error(err);
      toast.error("Thao tác thất bại");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleAddAddress = () =>
    setAddresses((prev) => [
      ...prev,
      getNewAddress(nextAddressId, formData.fullName, formData.phone),
    ]);
  

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(step === 1 || customer) && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <img src={preview || "/assets/avatar.jpg"} alt="avatar" className="h-28 w-28 rounded-full object-cover border" />
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-700">
                <Camera className="h-4 w-4 text-white" />
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Họ và tên *</Label>
              <Input value={formData.fullName} onChange={(e) => handleValueChange("fullName", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>SĐT *</Label>
              <Input value={formData.phone} onChange={(e) => handleValueChange("phone", e.target.value)} />
            </div>
            {!customer && (
              <>
                <div className="space-y-1">
                  <Label>Email *</Label>
                  <Input value={formData.email} onChange={(e) => handleValueChange("email", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Mật khẩu *</Label>
                  <Input type="password" onChange={(e) => handleValueChange("password", e.target.value)} />
                </div>
              </>
            )}
            <div className="space-y-1">
              <Label>Ngày sinh</Label>
              <DatePicker
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(val) => handleValueChange("dateOfBirth", val)}
              />
            </div>
          </div>
        </div>
      )}

      {(step === 2 || customer) && (
   <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4 custom-scroll">
   <div className={`space-y-6 ${customer ? "border-t pt-6 mt-6" : ""}`}>
     <h3 className="text-lg font-semibold">Quản lý địa chỉ</h3>
     <div className="flex flex-col gap-4">
       {addresses.map((addr, idx) => (
         <AddressFields
           key={addr.id}
           address={addr}
           index={idx}
           provinces={provinces}
           wards={wardsByProvince[addr.provinceCode] || []}
           onProvinceChange={(code) => handleProvinceChange(idx, code)}
           onAddressChange={handleAddressChange}
           onRemove={handleRemoveAddress}
           isRemovable={addresses.length > 1}
           isNewCustomer={!customer}
         />
       ))}
     </div>
     <Button type="button" onClick={handleAddAddress} variant="outline">
       <Plus className="h-4 w-4 mr-2" /> Thêm địa chỉ
     </Button>
   </div>
 </div>
      )}

      <div className="flex justify-between pt-4 border-t">
        {step === 2 && !customer && (
          <Button type="button" variant="outline" onClick={() => setStep(1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}
        <div className="flex-1 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isUploading || isLoading}>
            {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {customer ? "Cập nhật" : step === 2 ? "Hoàn tất & Thêm địa chỉ" : "Tiếp theo"}
          </Button>
        </div>
      </div>
    </form>
  );
}
