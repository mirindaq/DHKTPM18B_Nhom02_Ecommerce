import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import BrandDialog from "@/components/admin/brands/BrandDialog";
import BrandTable from "@/components/admin/brands/BrandTable";
import Pagination from "@/components/ui/pagination";
import { useQuery, useMutation } from "@/hooks";
import { brandService } from "@/services/brand.service";
import type {
  Brand,
  BrandListResponse,
  CreateBrandRequest,
} from "@/types/brand.type";

export default function Brands() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, _] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: brandsData,
    isLoading: isLoadingBrands,
    refetch: refetchBrands,
  } = useQuery<BrandListResponse>(
    () => brandService.getBrands(currentPage, pageSize, searchTerm),
    {
      queryKey: [
        "brands",
        currentPage.toString(),
        pageSize.toString(),
        searchTerm,
      ],
    }
  );

  const pagination = brandsData?.data;
  const brands = brandsData?.data?.data || [];

  // Create brand
  const createBrandMutation = useMutation(
    (data: CreateBrandRequest) => brandService.createBrand(data),
    {
      onSuccess: () => {
        toast.success("Thêm thương hiệu thành công");
        refetchBrands();
        setIsDialogOpen(false);
        setEditingBrand(null);
      },
      onError: (error) => {
        console.error("Error creating brand:", error);
        toast.error("Không thể thêm thương hiệu");
      },
    }
  );

  // Update brand
  const updateBrandMutation = useMutation(
    ({ id, data }: { id: number; data: CreateBrandRequest }) =>
      brandService.updateBrand(id, data),
    {
      onSuccess: () => {
        toast.success("Cập nhật thương hiệu thành công");
        refetchBrands();
        setIsDialogOpen(false);
        setEditingBrand(null);
      },
      onError: (error) => {
        console.error("Error updating brand:", error);
        toast.error("Không thể cập nhật thương hiệu");
      },
    }
  );

  // Toggle brand status
  const toggleStatusMutation = useMutation(
    (id: number) => brandService.changeStatusBrand(id),
    {
      onSuccess: () => {
        toast.success("Thay đổi trạng thái thành công");
        refetchBrands();
      },
      onError: (error) => {
        console.error("Error toggling brand status:", error);
        toast.error("Không thể thay đổi trạng thái thương hiệu");
      },
    }
  );

  const handleOpenAddDialog = () => {
    setEditingBrand(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (brand: Brand) => {
    setEditingBrand(brand);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBrand(null);
  };

  const handleFormSubmit = (data: CreateBrandRequest) => {
    if (editingBrand) {
      updateBrandMutation.mutate({ id: editingBrand.id, data });
    } else {
      createBrandMutation.mutate(data);
    }
  };

  const handleDelete = async (id: number) => {
    // TODO: Implement delete API when available
    toast.error("Chức năng xóa chưa được hỗ trợ");
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý thương hiệu
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các thương hiệu sản phẩm trong hệ thống
          </p>
        </div>
        <Button
          onClick={handleOpenAddDialog}
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm thương hiệu
        </Button>
      </div>

      <BrandTable
        brands={brands}
        onEdit={handleOpenEditDialog}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoadingBrands}
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
      <BrandDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        brand={editingBrand}
        onSubmit={handleFormSubmit}
        isLoading={
          createBrandMutation.isLoading || updateBrandMutation.isLoading
        }
      />
    </div>
  );
}
