// src/pages/admin/ArticleCategories.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ArticleCategoryDialog from "@/components/admin/article-categories/ArticleCategoryDialog";
import ArticleCategoryTable from "@/components/admin/article-categories/ArticleCategoryTable";
import Pagination from "@/components/ui/pagination";
import { useQuery, useMutation } from "@/hooks";
import { articleCategoryService } from "@/services/article-category.service";
import type {
  ArticleCategory,
  ArticleCategoryListResponse,
  CreateArticleCategoryRequest,
} from "@/types/article-category.type";

export default function ArticleCategories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ArticleCategory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useQuery<ArticleCategoryListResponse>(
    () => articleCategoryService.getCategories(currentPage, pageSize, searchTerm),
    {
      queryKey: ["article-categories", currentPage.toString(), pageSize.toString(), searchTerm],
    }
  );

  const pagination = categoriesData?.data;
  const categories = categoriesData?.data?.data || [];

  const createMutation = useMutation(
    (data: CreateArticleCategoryRequest) => articleCategoryService.createCategory(data),
    {
      onSuccess: () => {
        toast.success("Thêm danh mục thành công");
        refetchCategories();
        setIsDialogOpen(false);
        setEditingCategory(null);
      },
      onError: (err) => {
        console.error("Create article category error:", err);
        toast.error("Không thể thêm danh mục");
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: CreateArticleCategoryRequest }) =>
      articleCategoryService.updateCategory(id, data),
    {
      onSuccess: () => {
        toast.success("Cập nhật danh mục thành công");
        refetchCategories();
        setIsDialogOpen(false);
        setEditingCategory(null);
      },
      onError: (err) => {
        console.error("Update article category error:", err);
        toast.error("Không thể cập nhật danh mục");
      },
    }
  );

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (cat: ArticleCategory) => {
    setEditingCategory(cat);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: CreateArticleCategoryRequest) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = async (_id: number) => {
    // TODO: Implement delete API when available
    toast.error("Chức năng xóa chưa được hỗ trợ");
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý danh mục</h1>
          <p className="text-lg text-gray-600">
            Quản lý các danh mục tin tức trong hệ thống
          </p>
        </div>
        <Button
        onClick={handleOpenAdd}
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      <ArticleCategoryTable
        categories={categories}
        onEdit={handleOpenEdit}
        onSearch={handleSearch}
        onDelete={handleDelete}
        currentPage={currentPage}
        pageSize={pageSize}
        isLoading={isLoadingCategories}
      />

      {pagination && pagination.totalPage > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={currentPage} totalPages={pagination.totalPage} onPageChange={handlePageChange} />
        </div>
      )}

      <ArticleCategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={editingCategory}
        onSubmit={handleSubmit}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </div>
  );
}
