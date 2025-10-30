import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ArticleCategoryForm from "./ArticleCategoryForm";
import type { ArticleCategory, CreateArticleCategoryRequest } from "@/types/article-category.type";

export default function ArticleCategoryDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ArticleCategory | null;
  onSubmit: (data: CreateArticleCategoryRequest) => void;
  isLoading?: boolean;
}) {
  const handleCancel = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {category ? "Chỉnh sửa danh mục bài viết" : "Thêm danh mục bài viết mới"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {category ? "Cập nhật thông tin danh mục" : "Điền thông tin danh mục mới"}
          </DialogDescription>
        </DialogHeader>

        <ArticleCategoryForm
          category={category}
          onSubmit={(data) => {
            onSubmit(data);
          }}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
