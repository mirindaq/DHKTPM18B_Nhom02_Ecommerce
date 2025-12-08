import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { voucherService } from "@/services/voucher.service";
import type { VoucherDetailResponse } from "@/types/voucher-promotion.type";

interface VoucherDetailModalProps {
  open: boolean;
  onClose: () => void;
  voucherId: number | null;
  startDate?: string;
  endDate?: string;
}

export default function VoucherDetailModal({
  open,
  onClose,
  voucherId,
  startDate,
  endDate,
}: VoucherDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<VoucherDetailResponse | null>(null);

  useEffect(() => {
    if (open && voucherId) {
      fetchDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, voucherId]);

  const fetchDetail = async () => {
    if (!voucherId) return;

    try {
      setLoading(true);
      const response = await voucherService.getVoucherDetail(
        voucherId,
        startDate,
        endDate
      );
      setDetail(response.data);
    } catch (error) {
      console.error("Error fetching voucher detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[90vw] w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết sử dụng Voucher</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : detail ? (
          <div className="space-y-6">
            {/* Voucher Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Mã Voucher</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {detail.voucherCode}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tên Voucher</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {detail.voucherName}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Tổng số lần sử dụng
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {detail.totalUsage}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Tổng giảm giá
                  </div>
                  <div className="text-xl font-bold text-orange-600">
                    {detail.totalDiscountAmount.toLocaleString("vi-VN")}đ
                  </div>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Danh sách đơn hàng ({detail.orders.length})
              </h3>
              <div className="space-y-3">
                {detail.orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Không có đơn hàng nào sử dụng voucher này trong khoảng thời
                    gian đã chọn
                  </div>
                ) : (
                  detail.orders.map((order) => (
                    <div
                      key={order.orderId}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-start gap-2">
                          {/* <Package className="h-5 w-5 text-blue-500 mt-0.5" /> */}
                          <div>
                            <div className="text-xs text-gray-500">
                              Mã đơn hàng
                            </div>
                            <div className="font-semibold text-blue-600">
                              {order.orderCode}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          {/* <Calendar className="h-5 w-5 text-gray-500 mt-0.5" /> */}
                          <div>
                            <div className="text-xs text-gray-500">
                              Ngày đặt
                            </div>
                            <div className="font-medium">
                              {formatDate(order.orderDate)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          {/* <User className="h-5 w-5 text-purple-500 mt-0.5" /> */}
                          <div>
                            <div className="text-xs text-gray-500">
                              Khách hàng
                            </div>
                            <div className="font-medium">
                              {order.customerName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          {/* <DollarSign className="h-5 w-5 text-green-500 mt-0.5" /> */}
                          <div>
                            <div className="text-xs text-gray-500">
                              Giảm giá
                            </div>
                            <div className="font-bold text-green-600">
                              {order.discountAmount.toLocaleString("vi-VN")}đ
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Tổng đơn hàng:{" "}
                          <span className="font-semibold text-gray-900">
                            {order.orderTotal.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Sau giảm:{" "}
                          <span className="font-semibold text-blue-600">
                            {(
                              order.orderTotal - order.discountAmount
                            ).toLocaleString("vi-VN")}
                            đ
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
