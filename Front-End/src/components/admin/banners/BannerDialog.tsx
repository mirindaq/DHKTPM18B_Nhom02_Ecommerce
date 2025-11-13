import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Banner, CreateBannerRequest, UpdateBannerRequest } from "@/types/banner.type";
import BannerForm from "./BannerForm";

interface BannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: Banner | null;
  onSubmit: (data: CreateBannerRequest | UpdateBannerRequest) => void;
  isLoading?: boolean;
}

export default function BannerDialog({
  open,
  onOpenChange,
  banner,
  onSubmit,
  isLoading,
}: BannerDialogProps) {
  const handleSubmit = (data: CreateBannerRequest | UpdateBannerRequest) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {banner ? "Chỉnh sửa banner" : "Thêm banner mới"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {banner
              ? "Cập nhật thông tin banner"
              : "Điền thông tin banner mới"}
          </DialogDescription>
        </DialogHeader>

        <BannerForm
          banner={banner}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

