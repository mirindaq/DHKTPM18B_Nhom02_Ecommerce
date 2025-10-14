import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import VariantDialog from "@/components/admin/variants/VariantDialog"
import VariantTable from "@/components/admin/variants/VariantTable"
import Pagination from "@/components/ui/pagination"
import { useQuery, useMutation } from "@/hooks"
import { variantService } from "@/services/variant.service"
import type { Variant, VariantListResponse, CreateVariantRequest } from "@/types/variant.type"

export default function Variants() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, _] = useState(7)
  const [searchTerm, setSearchTerm] = useState("")

  const {
    data: variantsData,
    isLoading: isLoadingVariants,
    refetch: refetchVariants
  } = useQuery<VariantListResponse>(
    () => variantService.getVariants(currentPage, pageSize, searchTerm),
    {
      queryKey: ['variants', currentPage.toString(), pageSize.toString(), searchTerm],
    }
  )

  const pagination = variantsData?.data;
  const variants = variantsData?.data?.data || [];

  // Create variant
  const createVariantMutation = useMutation(
    (data: CreateVariantRequest) => variantService.createVariant(data),
    {
      onSuccess: () => {
        toast.success('Thêm variant thành công')
        refetchVariants()
        setIsDialogOpen(false)
        setEditingVariant(null)
      },
      onError: (error) => {
        console.error('Error creating variant:', error)
        toast.error('Không thể thêm variant')
      }
    }
  )

  // Update variant
  const updateVariantMutation = useMutation(
    ({ id, data }: { id: number; data: CreateVariantRequest }) =>
      variantService.updateVariant(id, data),
    {
      onSuccess: () => {
        toast.success('Cập nhật variant thành công')
        refetchVariants()
        setIsDialogOpen(false)
        setEditingVariant(null)
      },
      onError: (error) => {
        console.error('Error updating variant:', error)
        toast.error('Không thể cập nhật variant')
      }
    }
  )

  // Toggle variant status
  const toggleStatusMutation = useMutation(
    (id: number) => variantService.changeStatusVariant(id),
    {
      onSuccess: () => {
        toast.success('Thay đổi trạng thái thành công')
        refetchVariants()
      },
      onError: (error) => {
        console.error('Error toggling variant status:', error)
        toast.error('Không thể thay đổi trạng thái variant')
      }
    }
  )

  const handleOpenAddDialog = () => {
    setEditingVariant(null)
    setIsDialogOpen(true)
  }

  const handleOpenEditDialog = (variant: Variant) => {
    setEditingVariant(variant)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingVariant(null)
  }

  const handleFormSubmit = (data: CreateVariantRequest) => {
    if (editingVariant) {
      updateVariantMutation.mutate({ id: editingVariant.id, data })
    } else {
      createVariantMutation.mutate(data)
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

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm)
  }

  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý variant</h1>
          <p className="text-lg text-gray-600">
            Quản lý các variant sản phẩm trong hệ thống
          </p>
        </div>
        <Button
          onClick={handleOpenAddDialog}
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm variant
        </Button>
      </div>

      <VariantTable
        variants={variants}
        onEdit={handleOpenEditDialog}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoadingVariants}
        onSearch={handleSearch}
        currentPage={currentPage}
        pageSize={pageSize}
      />

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
      <VariantDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant={editingVariant}
        onSubmit={handleFormSubmit}
        isLoading={createVariantMutation.isLoading || updateVariantMutation.isLoading}
      />
    </div>
  )
}
