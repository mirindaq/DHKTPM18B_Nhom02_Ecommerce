import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Brand, CreateBrandRequest } from "@/types/brand.type";
import BrandForm from "./BrandForm";

interface BrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand | null;
  onSubmit: (data: CreateBrandRequest) => void;
  isLoading?: boolean;
}

export default function BrandDialog({
  open,
  onOpenChange,
  brand,
  onSubmit,
  isLoading,
}: BrandDialogProps) {
  const handleSubmit = (data: CreateBrandRequest) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {brand ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu mới"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {brand
              ? "Cập nhật thông tin thương hiệu"
              : "Điền thông tin thương hiệu mới"}
          </DialogDescription>
        </DialogHeader>

        <BrandForm
          brand={brand}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
