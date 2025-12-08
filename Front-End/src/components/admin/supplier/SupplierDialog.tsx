import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import SupplierForm from "./SupplierForm"
import type { Supplier, SupplierRequest } from "@/types/supplier.type"

interface SupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
  onSubmit: (data: SupplierRequest) => Promise<void>
  onFinished: () => void
  isLoading: boolean
}

export default function SupplierDialog({
  open,
  onOpenChange,
  supplier,
  onFinished,
  onSubmit,
  isLoading,
}: SupplierDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Chỉnh sửa Nhà cung cấp" : "Thêm Nhà cung cấp mới"}
          </DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết cho nhà cung cấp.
          </DialogDescription>
        </DialogHeader>
        <SupplierForm
          key={supplier?.id || "new-supplier"}
          supplier={supplier}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          onFinished={onFinished}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}