import { useState, useEffect } from 'react'
import { useQueryPagination, useMutation } from './index'
import { categoryService } from '@/services/category.service'
import type { Category, CreateCategoryRequest } from '@/types/category.type'
import { toast } from 'sonner'

export function useCategories() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories
  } = useQueryPagination(
    () => categoryService.getCategories(currentPage, pageSize),
    {
      queryKey: ['categories', currentPage, pageSize],
      onError: (error) => {
        console.error('Error fetching categories:', error)
        toast.error('Không thể tải danh sách danh mục')
      }
    }
  )

  // Create category
  const createCategoryMutation = useMutation(
    (data: CreateCategoryRequest) => categoryService.createCategory(data),
    {
      onSuccess: () => {
        toast.success('Thêm danh mục thành công')
        refetchCategories()
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

  // Handle create/update
  const handleSubmit = (data: CreateCategoryRequest, editingCategory?: Category | null) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data })
    } else {
      createCategoryMutation.mutate(data)
    }
  }

  // Handle toggle status
  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id)
  }

  // Get categories array
  const categories = categoriesData?.result || []

  return {
    // Data
    categories,
    pagination: categoriesData ? {
      page: categoriesData.page,
      limit: categoriesData.limit,
      totalPage: categoriesData.totalPage,
      totalItem: categoriesData.totalItem
    } : null,
    
    // Loading states
    isLoadingCategories,
    isCreating: createCategoryMutation.isLoading,
    isUpdating: updateCategoryMutation.isLoading,
    isTogglingStatus: toggleStatusMutation.isLoading,
    
    // Errors
    categoriesError,
    
    // Actions
    handleSubmit,
    handleToggleStatus,
    refetchCategories,
    
    // Pagination
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize
  }
}
