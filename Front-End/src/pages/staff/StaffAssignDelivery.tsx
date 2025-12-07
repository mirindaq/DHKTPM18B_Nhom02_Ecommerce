import { useState } from "react";
import { toast } from "sonner";
import { OrderAssignmentTable, AssignShipperDialog } from "@/components/staff";
import Pagination from "@/components/ui/pagination";
import { useQuery, useMutation } from "@/hooks";
import { orderService } from "@/services/order.service";
import { shipperService } from "@/services/shipper.service";
import { deliveryAssignmentService } from "@/services/delivery-assignment.service";
import type { OrderResponse, OrderListResponse } from "@/types/order.type";
import type { ShipperListResponse } from "@/types/shipper.type";
import { Package, Truck } from "lucide-react";

export default function StaffAssignDelivery() {
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null
  );
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch orders need shipper (SHIPPED status)
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
  } = useQuery<OrderListResponse>(
    () => orderService.getOrdersNeedShipper(currentPage, pageSize),
    {
      queryKey: [
        "orders-need-shipper",
        currentPage.toString(),
        pageSize.toString(),
      ],
    }
  );

  // Fetch active shippers
  const { data: shippersData } = useQuery<ShipperListResponse>(
    () => shipperService.getAllActiveShippers(),
    {
      queryKey: ["active-shippers"],
    }
  );

  const pagination = ordersData?.data;
  const orders = ordersData?.data?.data || [];
  const shippers = shippersData?.data || [];

  // Assign shipper mutation
  const assignShipperMutation = useMutation(
    ({
      orderId,
      shipperId,
      notes,
    }: {
      orderId: number;
      shipperId: number;
      notes?: string;
    }) =>
      deliveryAssignmentService.assignShipperToOrder({
        orderId,
        shipperId,
        notes,
      }),
    {
      onSuccess: () => {
        toast.success("Gán shipper thành công");
        refetchOrders();
        setIsAssignDialogOpen(false);
        setSelectedOrder(null);
      },
      onError: (error: any) => {
        console.error("Error assigning shipper:", error);
        toast.error(error?.response?.data?.message || "Không thể gán shipper");
      },
    }
  );

  const handleAssignShipper = (order: OrderResponse) => {
    setSelectedOrder(order);
    setIsAssignDialogOpen(true);
  };

  const handleCloseAssignDialog = () => {
    setIsAssignDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleConfirmAssign = (
    orderId: number,
    shipperId: number,
    notes?: string
  ) => {
    assignShipperMutation.mutate({ orderId, shipperId, notes });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Gán đơn hàng cho Shipper
        </h1>
        <p className="text-lg text-gray-600">
          Quản lý và gán shipper cho các đơn hàng cần giao
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">
                Đơn cần gán shipper
              </p>
              <p className="text-2xl font-bold text-purple-700">
                {pagination?.totalItem || 0}
              </p>
            </div>
            <Package className="h-12 w-12 text-purple-600 opacity-20" />
          </div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">
                Shipper khả dụng
              </p>
              <p className="text-2xl font-bold text-green-700">
                {shippers.length}
              </p>
            </div>
            <Truck className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Table */}
      <OrderAssignmentTable
        orders={orders}
        onAssignShipper={handleAssignShipper}
        isLoading={isLoadingOrders}
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

      {/* Assign Dialog */}
      <AssignShipperDialog
        open={isAssignDialogOpen}
        onOpenChange={handleCloseAssignDialog}
        order={selectedOrder}
        shippers={shippers}
        onAssign={handleConfirmAssign}
        isAssigning={assignShipperMutation.isLoading}
      />
    </div>
  );
}
