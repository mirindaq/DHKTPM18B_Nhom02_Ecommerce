import { useState } from "react";
import { toast } from "sonner";
import { DeliveryDetailDialog, DeliveryTable } from "@/components/shipper";
import { useQuery, useMutation } from "@/hooks";
import { deliveryAssignmentService } from "@/services/delivery-assignment.service";
import { useDeliveryWebSocket } from "@/hooks/useDeliveryWebSocket";
import type {
  DeliveryAssignment,
  DeliveryAssignmentListResponse,
} from "@/types/delivery-assignment.type";

export default function Deliveries() {
  const [selectedDelivery, setSelectedDelivery] =
    useState<DeliveryAssignment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Fetch all deliveries
  const {
    data: deliveriesData,
    isLoading,
    refetch: refetchDeliveries,
  } = useQuery<DeliveryAssignmentListResponse>(
    () => deliveryAssignmentService.getMyDeliveries(),
    {
      queryKey: ["my-deliveries"],
    }
  );

  const allDeliveries = deliveriesData?.data || [];

  // WebSocket for real-time delivery updates
  useDeliveryWebSocket({
    onDeliveryNotification: () => {
      refetchDeliveries();
    },
    enabled: true,
  });

  // Start delivery mutation
  const startDeliveryMutation = useMutation(
    (deliveryId: number) => deliveryAssignmentService.startDelivery(deliveryId),
    {
      onSuccess: () => {
        toast.success("Bắt đầu giao hàng thành công");
        refetchDeliveries();
        setIsDetailDialogOpen(false);
      },
      onError: (error: any) => {
        console.error("Error starting delivery:", error);
        toast.error(
          error?.response?.data?.message || "Không thể bắt đầu giao hàng"
        );
      },
    }
  );

  // Complete delivery mutation
  const completeDeliveryMutation = useMutation(
    ({
      deliveryId,
      success,
      note,
      imageUrls,
    }: {
      deliveryId: number;
      success: boolean;
      note: string;
      imageUrls?: string[];
    }) =>
      deliveryAssignmentService.completeDelivery({
        deliveryAssignmentId: deliveryId,
        success,
        note,
        imageUrls,
      }),
    {
      onSuccess: () => {
        toast.success("Hoàn thành giao hàng thành công");
        refetchDeliveries();
        setIsDetailDialogOpen(false);
      },
      onError: (error: any) => {
        console.error("Error completing delivery:", error);
        toast.error(
          error?.response?.data?.message || "Không thể hoàn thành giao hàng"
        );
      },
    }
  );

  // Fail delivery mutation
  const failDeliveryMutation = useMutation(
    ({
      deliveryId,
      success,
      note,
      imageUrls,
    }: {
      deliveryId: number;
      success: boolean;
      note: string;
      imageUrls?: string[];
    }) =>
      deliveryAssignmentService.failDelivery({
        deliveryAssignmentId: deliveryId,
        success,
        note,
        imageUrls,
      }),
    {
      onSuccess: () => {
        toast.success("Đã cập nhật trạng thái giao hàng thất bại");
        refetchDeliveries();
        setIsDetailDialogOpen(false);
      },
      onError: (error: any) => {
        console.error("Error failing delivery:", error);
        toast.error(
          error?.response?.data?.message || "Không thể cập nhật trạng thái"
        );
      },
    }
  );

  const handleViewDetail = (delivery: DeliveryAssignment) => {
    setSelectedDelivery(delivery);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedDelivery(null);
  };

  const handleStartDelivery = (deliveryId: number) => {
    startDeliveryMutation.mutate(deliveryId);
  };

  const handleCompleteDelivery = (
    deliveryId: number,
    note?: string,
    images?: string[]
  ) => {
    if (!note) {
      toast.error("Vui lòng nhập ghi chú");
      return;
    }
    completeDeliveryMutation.mutate({
      deliveryId,
      success: true,
      note,
      imageUrls: images,
    });
  };

  const handleFailDelivery = (
    deliveryId: number,
    note?: string,
    images?: string[]
  ) => {
    if (!note || !images || images.length === 0) {
      toast.error("Vui lòng nhập ghi chú và tải lên hình ảnh");
      return;
    }
    failDeliveryMutation.mutate({
      deliveryId,
      success: false,
      note,
      imageUrls: images,
    });
  };

  const getStatistics = () => {
    const assigned = allDeliveries.filter(
      (d) => d.deliveryStatus === "ASSIGNED"
    ).length;
    const inTransit = allDeliveries.filter(
      (d) => d.deliveryStatus === "DELIVERING"
    ).length;
    const delivered = allDeliveries.filter(
      (d) => d.deliveryStatus === "DELIVERED"
    ).length;

    return { assigned, inTransit, delivered };
  };

  const stats = getStatistics();

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Quản lý giao hàng
        </h1>
        <p className="text-lg text-gray-600">
          Quản lý và theo dõi các đơn hàng cần giao
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Chờ giao</p>
          <p className="text-2xl font-bold text-blue-700">{stats.assigned}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600 font-medium">Đang giao</p>
          <p className="text-2xl font-bold text-purple-700">
            {stats.inTransit}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-medium">Đã giao</p>
          <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
        </div>
      </div>

      {/* Delivery Table */}
      <DeliveryTable
        deliveries={allDeliveries}
        onViewDetail={handleViewDetail}
        isLoading={isLoading}
      />

      {/* Detail Dialog */}
      <DeliveryDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={handleCloseDetailDialog}
        delivery={selectedDelivery}
        onStartDelivery={handleStartDelivery}
        onCompleteDelivery={handleCompleteDelivery}
        onFailDelivery={handleFailDelivery}
        isStarting={startDeliveryMutation.isLoading}
        isCompleting={completeDeliveryMutation.isLoading}
        isFailing={failDeliveryMutation.isLoading}
      />
    </div>
  );
}
