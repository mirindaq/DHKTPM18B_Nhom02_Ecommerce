import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import type {
  Product,
  ProductListResponse,
} from "@/types/product.type";
import { ProductTable } from "@/components/admin/products";
import Pagination from "@/components/ui/pagination";
import { toast } from "sonner";
import { productService } from "@/services/product.service";
import { useQuery, useMutation } from "@/hooks";
import { Plus } from "lucide-react";

export default function Products() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, _] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useQuery<ProductListResponse>(
    () => productService.getProducts(currentPage, pageSize, searchTerm),
    {
      queryKey: [
        "products",
        currentPage.toString(),
        pageSize.toString(),
        searchTerm,
      ],
    }
  );

  const pagination = productsData?.data;
  const products = productsData?.data?.data || [];

  const handleOpenAddDialog = () => {
    navigate("/admin/products/add");
  };

  // Toggle product status
  const toggleStatusMutation = useMutation(
    (id: number) => productService.changeStatusProduct(id),
    {
      onSuccess: () => {
        toast.success('Thay đổi trạng thái thành công');
        refetchProducts();
      },
      onError: (error) => {
        console.error('Error toggling product status:', error);
        toast.error('Không thể thay đổi trạng thái sản phẩm');
      }
    }
  );

  const handleOpenEditDialog = (product: Product) => {
    navigate(`/admin/products/edit/${product.id}`);
  };

  const handleDelete = async (_id: number) => {
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
    setCurrentPage(1); // Reset to first page when searching
  };


  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý sản phẩm
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý các sản phẩm sản phẩm trong hệ thống
          </p>
        </div>
        <Button
          onClick={handleOpenAddDialog}
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </div>

      <ProductTable
        products={products}
        onEdit={handleOpenEditDialog}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoadingProducts}
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

    </div>
  );
}
