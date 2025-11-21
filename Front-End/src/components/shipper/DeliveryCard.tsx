import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Package, MapPin, Phone, User, Calendar, Clock } from "lucide-react";
import type { DeliveryAssignment } from "@/types/delivery-assignment.type";

interface DeliveryCardProps {
  delivery: DeliveryAssignment;
  onViewDetail: (delivery: DeliveryAssignment) => void;
  onStartDelivery?: (deliveryId: number) => void;
  isStarting?: boolean;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ASSIGNED: {
    label: "Đã gán",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  DELIVERING: {
    label: "Đang giao",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  DELIVERED: {
    label: "Đã giao",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  FAILED: {
    label: "Thất bại",
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

export default function DeliveryCard({
  delivery,
  onViewDetail,
  onStartDelivery,
  isStarting = false,
}: DeliveryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusInfo =
    statusConfig[delivery.deliveryStatus] || statusConfig.ASSIGNED;
  const canStart = delivery.deliveryStatus === "ASSIGNED";

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-900">
              Đơn hàng #{delivery.order?.id || "-"}
            </span>
          </div>
          <Badge className={`${statusInfo.color} border`}>
            {statusInfo.label}
          </Badge>
        </div>

        {/* Customer Info */}
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <User className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {delivery.order?.receiverName || "N/A"}
              </p>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Phone className="h-3 w-3" />
                <span>{delivery.order?.receiverPhone || "N/A"}</span>
              </div>
            </div>
          </div>

          {delivery.order?.receiverAddress && (
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
              <p className="text-sm text-gray-700 line-clamp-2">
                {delivery.order.receiverAddress}
              </p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>Gán lúc: {formatDate(delivery.createdAt)}</span>
          </div>
          {delivery.deliveredAt && (
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>Hoàn thành: {formatDate(delivery.deliveredAt)}</span>
            </div>
          )}
        </div>

        {delivery.note && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Ghi chú:</span> {delivery.note}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50 space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetail(delivery)}
          className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          Chi tiết
        </Button>
        {canStart && onStartDelivery && (
          <Button
            size="sm"
            onClick={() => onStartDelivery(delivery.id)}
            disabled={isStarting}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isStarting ? "Đang xử lý..." : "Bắt đầu giao"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
