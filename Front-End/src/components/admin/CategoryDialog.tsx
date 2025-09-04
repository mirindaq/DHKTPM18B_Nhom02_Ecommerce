import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import CategoryForm from "./CategoryForm"
import type { Category, CreateCategoryRequest } from "@/types/category.type"

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSubmit: (data: CreateCategoryRequest) => void
  isLoading?: boolean
}

export default function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isLoading
}: CategoryDialogProps) {
  const handleSubmit = (data: CreateCategoryRequest) => {
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
            {category ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {category ? "Cập nhật thông tin danh mục" : "Điền thông tin danh mục mới"}
          </DialogDescription>
        </DialogHeader>
        
        <CategoryForm
          category={category}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
