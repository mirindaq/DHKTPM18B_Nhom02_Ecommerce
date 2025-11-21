import { useState } from "react";
import { toast } from "sonner";
import { OrderTable, OrderDetailDialog, OrderFilter } from "@/components/admin/orders";
import Pagination from "@/components/ui/pagination";
import { useQuery, useMutation } from "@/hooks";
import { orderService } from "@/services/order.service";
import type {
  OrderResponse,
  OrderListResponse,
  OrderSearchParams,
  OrderStatus,
} from "@/types/order.type";

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<OrderSearchParams>({});

  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
  } = useQuery<OrderListResponse>(
    () =>
      orderService.getAllOrdersForAdmin({
        ...searchParams,
        page: currentPage,
        size: pageSize,
      }),
    {
      queryKey: [
        "orders",
        currentPage.toString(),
        pageSize.toString(),
        JSON.stringify(searchParams),
      ],
    }
  );

  const pagination = ordersData?.data;
  const orders = ordersData?.data?.data || [];

  // Confirm order mutation
  const confirmOrderMutation = useMutation(
    (orderId: number) => orderService.confirmOrder(orderId),
    {
      onSuccess: () => {
        toast.success("Tiếp nhận đơn hàng thành công");
        refetchOrders();
        setIsDetailDialogOpen(false);
        setSelectedOrder(null);
      },
      onError: (error: any) => {
        console.error("Error confirming order:", error);
        toast.error(error?.response?.data?.message || "Không thể tiếp nhận đơn hàng");
      },
    }
  );

  // Cancel order mutation
  const cancelOrderMutation = useMutation(
    (orderId: number) => orderService.cancelOrder(orderId),
    {
      onSuccess: () => {
        toast.success("Hủy đơn hàng thành công");
        refetchOrders();
        setIsDetailDialogOpen(false);
        setSelectedOrder(null);
      },
      onError: (error: any) => {
        console.error("Error canceling order:", error);
        toast.error(error?.response?.data?.message || "Không thể hủy đơn hàng");
      },
    }
  );

  // Process order mutation
  const processOrderMutation = useMutation(
    (orderId: number) => orderService.processOrder(orderId),
    {
      onSuccess: () => {
        toast.success("Xử lý đơn hàng thành công");
        refetchOrders();
        setIsDetailDialogOpen(false);
        setSelectedOrder(null);
      },
      onError: (error: any) => {
        console.error("Error processing order:", error);
        toast.error(error?.response?.data?.message || "Không thể xử lý đơn hàng");
      },
    }
  );

  // Complete order mutation
  const completeOrderMutation = useMutation(
    (orderId: number) => orderService.completeOrder(orderId),
    {
      onSuccess: () => {
        toast.success("Hoàn thành đơn hàng thành công");
        refetchOrders();
        setIsDetailDialogOpen(false);
        setSelectedOrder(null);
      },
      onError: (error: any) => {
        console.error("Error completing order:", error);
        toast.error(error?.response?.data?.message || "Không thể hoàn thành đơn hàng");
      },
    }
  );

  const handleViewDetail = (order: OrderResponse) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleConfirmOrder = (orderId: number) => {
    confirmOrderMutation.mutate(orderId);
  };

  const handleCancelOrder = (orderId: number) => {
    cancelOrderMutation.mutate(orderId);
  };

  const handleProcessOrder = (orderId: number) => {
    processOrderMutation.mutate(orderId);
  };

  const handleCompleteOrder = (orderId: number) => {
    completeOrderMutation.mutate(orderId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (filters: {
    customerName?: string;
    orderDate?: string;
    customerPhone?: string;
    status?: OrderStatus;
    isPickup?: boolean;
  }) => {
    setSearchParams(filters);
    setCurrentPage(1); // Reset to first page when searching
  };

  const getTotalRevenue = () => {
    return orders
      .filter((order) => 
        order.status === "COMPLETED" || 
        order.status === "SHIPPED" || 
        order.status === "DELIVERING"
      )
      .reduce((sum, order) => sum + order.finalTotalPrice, 0);
  };

  const getPendingOrdersCount = () => {
    return orders.filter((order) => order.status === "PENDING").length;
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
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Quản lý đơn hàng
        </h1>
        <p className="text-lg text-gray-600">
          Quản lý và theo dõi tất cả đơn hàng trong hệ thống
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Tổng đơn hàng</p>
          <p className="text-2xl font-bold text-blue-700">
            {pagination?.totalItem || 0}
          </p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600 font-medium">
            Đơn chờ xử lý
          </p>
          <p className="text-2xl font-bold text-yellow-700">
            {getPendingOrdersCount()}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-medium">Doanh thu</p>
          <p className="text-2xl font-bold text-green-700">
            {formatPrice(getTotalRevenue())}
          </p>
        </div>
      </div>

      {/* Filter */}
      <OrderFilter onSearch={handleSearch} isLoading={isLoadingOrders} />

      {/* Table */}
      <OrderTable
        orders={orders}
        onViewDetail={handleViewDetail}
        isLoading={isLoadingOrders}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={
          searchParams.customerName ||
          searchParams.customerPhone ||
          ""
        }
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

      {/* Detail Dialog */}
      <OrderDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={handleCloseDetailDialog}
        order={selectedOrder}
        onConfirmOrder={handleConfirmOrder}
        onCancelOrder={handleCancelOrder}
        onProcessOrder={handleProcessOrder}
        onCompleteOrder={handleCompleteOrder}
        isConfirming={confirmOrderMutation.isLoading}
        isCanceling={cancelOrderMutation.isLoading}
        isProcessing={processOrderMutation.isLoading}
        isCompleting={completeOrderMutation.isLoading}
      />
    </div>
  );
}
