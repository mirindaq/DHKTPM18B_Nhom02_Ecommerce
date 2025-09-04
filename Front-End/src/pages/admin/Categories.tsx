import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import CategoryDialog from "@/components/admin/CategoryDialog"
import CategoryTable from "@/components/admin/CategoryTable"
import Pagination from "@/components/ui/pagination"
import { useQuery, useMutation } from "@/hooks"
import { categoryService } from "@/services/category.service"
import type { Category, CategoryListResponse, CreateCategoryRequest } from "@/types/category.type"

export default function Categories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, _] = useState(7)
  
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    refetch: refetchCategories
  } = useQuery<CategoryListResponse>(
    () => categoryService.getCategories(currentPage, pageSize),
    {
      queryKey: ['categories', currentPage.toString(), pageSize.toString()],
    }
  )

  const pagination = categoriesData?.data;
  const categories = categoriesData?.data?.data || [];

  // Create category
  const createCategoryMutation = useMutation(
    (data: CreateCategoryRequest) => categoryService.createCategory(data),
    {
      onSuccess: () => {
        toast.success('Thêm danh mục thành công')
        refetchCategories()
        setIsDialogOpen(false)
        setEditingCategory(null)
      },
      onError: (error) => {
        console.error('Error creating category:', error)
        toast.error('Không thể thêm danh mục')
      }
    }
  )

  // Update category
  const updateCategoryMutation = useMutation(
    ({ id, data }: { id: number; data: CreateCategoryRequest }) => 
      categoryService.updateCategory(id, data),
    {
      onSuccess: () => {
        toast.success('Cập nhật danh mục thành công')
        refetchCategories()
        setIsDialogOpen(false)
        setEditingCategory(null)
      },
      onError: (error) => {
        console.error('Error updating category:', error)
        toast.error('Không thể cập nhật danh mục')
      }
    }
  )

  // Toggle category status
  const toggleStatusMutation = useMutation(
    (id: number) => categoryService.changeStatusCategory(id),
    {
      onSuccess: () => {
        toast.success('Thay đổi trạng thái thành công')
        refetchCategories()
      },
      onError: (error) => {
        console.error('Error toggling category status:', error)
        toast.error('Không thể thay đổi trạng thái danh mục')
      }
    }
  )

  const handleOpenAddDialog = () => {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  const handleOpenEditDialog = (category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
  }

  const handleFormSubmit = (data: CreateCategoryRequest) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data })
    } else {
      createCategoryMutation.mutate(data)
    }
  }

  const handleDelete = async (id: number) => {
    // TODO: Implement delete API when available
    toast.error("Chức năng xóa chưa được hỗ trợ")
  }

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý danh mục</h1>
          <p className="text-lg text-gray-600">
            Quản lý các danh mục sản phẩm trong hệ thống
          </p>
        </div>
        <Button 
          onClick={handleOpenAddDialog}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

  
      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <CategoryTable
          categories={categories}
          onEdit={handleOpenEditDialog}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          isLoading={isLoadingCategories}
        />
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPage > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Dialog */}
      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={editingCategory}
        onSubmit={handleFormSubmit}
        isLoading={createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
      />
    </div>
  )
}
