import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Truck } from "lucide-react"
import { toast } from "sonner"
import { useQuery, useMutation } from "@/hooks"
import Pagination from "@/components/ui/pagination"
import { supplierService } from "@/services/supplier.service"
import type {
  Supplier,
  SupplierRequest,
  SupplierListResponse,
} from "@/types/supplier.type"

// Import components
import SupplierTable from "@/components/admin/supplier/SupplierTable"
import SupplierDialog from "@/components/admin/supplier/SupplierDialog"
import SupplierFilter from "@/components/admin/supplier/SupplierFilter"
import ExcelActions from "@/components/admin/common/ExcelActions"

export default function Suppliers() {
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(7)
  const [filters, setFilters] = useState<any>({})

  // Lấy danh sách
  const {
    data: suppliersData,
    isLoading: isLoadingSuppliers,
    refetch: refetchSuppliers,
  } = useQuery<SupplierListResponse>(
    () =>
      supplierService.getSuppliers({
        page: currentPage,
        size: pageSize,
        ...filters,
      }),
    {
      queryKey: [
        "suppliers",
        currentPage.toString(),
        pageSize.toString(),
        filters,
      ],
    },
  )

  const suppliers = suppliersData?.data?.data || []
  const pagination = suppliersData?.data

  const onSuccess = (message: string) => {
    toast.success(message)
    refetchSuppliers()
    setIsAddEditDialogOpen(false)
    setEditingSupplier(null)
  }

  // Mutations
  const createSupplierMutation = useMutation(
    (data: SupplierRequest) => supplierService.createSupplier(data),
    {
      onSuccess: () => onSuccess("Thêm nhà cung cấp thành công"),
      onError: (e: any) =>
        toast.error(e?.response?.data?.message || "Không thể thêm"),
    },
  )

  const updateSupplierMutation = useMutation(
    ({ id, data }: { id: string; data: SupplierRequest }) =>
      supplierService.updateSupplier(id, data),
    {
      onSuccess: () => onSuccess("Cập nhật thành công"),
      onError: (e: any) =>
        toast.error(e?.response?.data?.message || "Không thể cập nhật"),
    },
  )

  const toggleStatusMutation = useMutation(
    (id: string) => supplierService.changeStatusSupplier(id),
    {
      onSuccess: () => {
        toast.success("Thay đổi trạng thái thành công")
        refetchSuppliers()
      },
      onError: (error: any) => {
        toast.error(
          `Lỗi: ${error?.response?.data?.message || "Không thể đổi trạng thái"}`,
        )
      },
    },
  )

  const handleFormSubmit = async (data: SupplierRequest) => {
    if (editingSupplier) {
      updateSupplierMutation.mutate({ id: editingSupplier.id, data: data })
    } else {
      createSupplierMutation.mutate(data)
    }
  }

  const handlePageChange = (page: number) => setCurrentPage(page)

  const handleFormFinished = () => {
    toast.success(editingSupplier ? "Cập nhật thành công" : "Thêm thành công")
    refetchSuppliers()
    setIsAddEditDialogOpen(false)
    setEditingSupplier(null)
  }

  const handleToggleStatus = (supplier: Supplier) => {
    toggleStatusMutation.mutate(supplier.id)
  }

  const handleSearch = (newFilters: any) => {
    setCurrentPage(1)
    setFilters(newFilters)
  }

  return (
    <div className="space-y-3 p-2">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck /> Quản lý nhà cung cấp
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý thông tin các nhà cung cấp.
          </p>
        </div>
        <div className="flex gap-2">
          <ExcelActions
            onDownloadTemplate={supplierService.downloadTemplate}
            onImport={supplierService.importSuppliers}
            onExport={supplierService.exportSuppliers}
            onImportSuccess={refetchSuppliers}
            templateFileName="supplier_template.xlsx"
            exportFileName="suppliers.xlsx"
          />
          <Button
            size="lg"
            onClick={() => {
              setEditingSupplier(null)
              setIsAddEditDialogOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm nhà cung cấp
          </Button>
        </div>
      </div>

      <SupplierFilter onSearch={handleSearch} />

      <SupplierTable
        suppliers={suppliers}
        isLoading={isLoadingSuppliers}
        onEdit={(supplier) => {
          setEditingSupplier(supplier)
          setIsAddEditDialogOpen(true)
        }}
        onToggleStatus={handleToggleStatus}
        currentPage={currentPage}
        pageSize={pageSize}
      />

      {pagination && pagination.totalPage > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <SupplierDialog
        open={isAddEditDialogOpen}
        onOpenChange={(open) => {
          setIsAddEditDialogOpen(open)
          if (!open) setEditingSupplier(null)
        }}
        supplier={editingSupplier}
        onSubmit={handleFormSubmit}
        onFinished={handleFormFinished}
        isLoading={
          createSupplierMutation.isLoading || updateSupplierMutation.isLoading
        }
      />
    </div>
  )
}