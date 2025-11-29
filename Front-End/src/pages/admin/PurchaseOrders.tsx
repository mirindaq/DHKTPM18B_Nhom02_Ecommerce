import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@/hooks";
import Pagination from "@/components/ui/pagination";
import { purchaseOrderService } from "@/services/purchase-order.service";
import type {
  PurchaseOrder,
  PurchaseOrderListResponse,
  PurchaseOrderFilter,
  CreatePurchaseOrderRequest,
} from "@/types/purchase-order.type";
import {
  PurchaseOrderTable,
  PurchaseOrderFilter as PurchaseOrderFilterComponent,
  PurchaseOrderDetailDialog,
  CreatePurchaseOrderDialog,
} from "@/components/admin/purchase-order";

export default function PurchaseOrders() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<PurchaseOrderFilter>({});

  const {
    data: purchaseOrdersData,
    isLoading: isLoadingPurchaseOrders,
    refetch: refetchPurchaseOrders,
  } = useQuery<PurchaseOrderListResponse>(
    () =>
      purchaseOrderService.getPurchaseOrders(currentPage, pageSize, searchParams),
    {
      queryKey: [
        "purchase-orders",
        currentPage.toString(),
        pageSize.toString(),
        JSON.stringify(searchParams),
      ],
    }
  );

  const pagination = purchaseOrdersData?.data;
  const purchaseOrders = purchaseOrdersData?.data?.data || [];

  // Create mutation
  const createMutation = useMutation(
    (request: CreatePurchaseOrderRequest) =>
      purchaseOrderService.createPurchaseOrder(request),
    {
      onSuccess: () => {
        toast.success("Tạo phiếu nhập hàng thành công");
        refetchPurchaseOrders();
        setIsCreateDialogOpen(false);
      },
      onError: (error: any) => {
        console.error("Error creating purchase order:", error);
        toast.error(
          error?.response?.data?.message || "Không thể tạo phiếu nhập hàng"
        );
      },
    }
  );



  const handleViewDetail = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setIsDetailDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (filters: PurchaseOrderFilter) => {
    setSearchParams(filters);
    setCurrentPage(1);
  };

  const getTotalAmount = () => {
    return purchaseOrders.reduce((sum, po) => sum + po.totalPrice, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý nhập hàng
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý và theo dõi các phiếu nhập hàng trong hệ thống
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo phiếu nhập hàng
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Tổng phiếu nhập</p>
          <p className="text-2xl font-bold text-blue-700">
            {pagination?.totalItem || 0}
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600 font-medium">Tổng giá trị</p>
          <p className="text-2xl font-bold text-purple-700">
            {formatPrice(getTotalAmount())}
          </p>
        </div>
      </div>

      {/* Filter */}
      <PurchaseOrderFilterComponent
        onSearch={handleSearch}
        isLoading={isLoadingPurchaseOrders}
      />

      {/* Table */}
      <PurchaseOrderTable
        purchaseOrders={purchaseOrders}
        isLoading={isLoadingPurchaseOrders}
        onViewDetail={handleViewDetail}
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

      {/* Dialogs */}
      <CreatePurchaseOrderDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        isSubmitting={createMutation.isLoading}
      />

      <PurchaseOrderDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        purchaseOrder={selectedPurchaseOrder}
      />
    </div>
  );
}
