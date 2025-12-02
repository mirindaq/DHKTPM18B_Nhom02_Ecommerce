import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Trash2 } from "lucide-react";
import { customerService } from "@/services/customer.service";
import { toast } from "sonner";
import { useState } from "react";
import type { AddressFormData } from '@/types/customer.type';

interface AddressFieldsProps {
    address: AddressFormData; // thay any
    index: number;
    provinces: any[];
    wards: any[];
    onProvinceChange: (provinceCode: string) => void;
    onAddressChange: (index: number, field: keyof AddressFormData, value: any) => void; // <-- sửa đây
    onRemove: (index: number) => void;
    isRemovable?: boolean;
    isNewCustomer?: boolean;
  }
  

export default function AddressFields({
  address,
  index,
  provinces,
  wards,
  onProvinceChange,
  onAddressChange,
  onRemove,
  isRemovable = true,
  isNewCustomer = false,
}: AddressFieldsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

 const handleDeleteAddress = async () => {
  onRemove(index);
};


  return (
    <div className="relative border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
      <h4 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
        <MapPin className="h-4 w-4" /> Địa chỉ {index + 1}
            </h4>
        {isRemovable && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDeleteAddress}
            disabled={isDeleting}
            className="text-red-500 hover:bg-red-50"
          >
            <Trash2 className={`h-4 w-4 ${isDeleting ? "animate-spin" : ""}`} />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  
        <div>
          <Label>Tên người nhận *</Label>
          <Input
            value={address.fullName || ""}
            onChange={(e) => onAddressChange(index, "fullName", e.target.value)}
          />
        </div>
        <div>
          <Label>SĐT người nhận *</Label>
          <Input
            value={address.phone || ""}
            onChange={(e) => onAddressChange(index, "phone", e.target.value)}
          />
        </div>
        <div>
          <Label>Tỉnh/Thành phố *</Label>
          <select
            className="w-full border rounded-md p-2"
            value={address.provinceCode || ""}
            onChange={(e) => onProvinceChange(e.target.value)}
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Phường/Xã *</Label>
          <select
            className="w-full border rounded-md p-2"
            value={address.wardCode || ""}
            onChange={(e) => onAddressChange(index, "wardCode", e.target.value)}
          >
            <option value="">Chọn phường/xã</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 ">
          <Label>Địa chỉ chi tiết (Số nhà, Tên đường) *</Label>
          <Input
            value={address.subAddress || ""}
            onChange={(e) => onAddressChange(index, "subAddress", e.target.value)}
            placeholder="Ví dụ: 123 Đường ABC, Phường XYZ"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <Checkbox
          checked={address.isDefault || false}
          onCheckedChange={(checked) => onAddressChange(index, "isDefault", !!checked)}
        />
        <Label>Đặt làm địa chỉ mặc định</Label>
      </div>
    </div>
  );
}
