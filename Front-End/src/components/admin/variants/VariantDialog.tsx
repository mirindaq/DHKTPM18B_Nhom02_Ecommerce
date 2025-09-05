import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { Variant, CreateVariantRequest } from "@/types/variant.type"
import VariantForm from "./VariantForm"

interface VariantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: Variant | null
  onSubmit: (data: CreateVariantRequest) => void
  isLoading?: boolean
}

export default function VariantDialog({
  open,
  onOpenChange,
  variant,
  onSubmit,
  isLoading
}: VariantDialogProps) {
  const handleSubmit = (data: CreateVariantRequest) => {
    onSubmit(data)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {variant ? "Chỉnh sửa variant" : "Thêm variant mới"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {variant ? "Cập nhật thông tin variant" : "Điền thông tin variant mới"}
          </DialogDescription>
        </DialogHeader>
        
        <VariantForm
          variant={variant}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
