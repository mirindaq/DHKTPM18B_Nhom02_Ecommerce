import { useEffect, useRef, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Check,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { orderService } from "@/services/order.service";

type PaymentStatus = "waiting" | "success" | "failed";

interface PaymentStatusModalProps {
  open: boolean;
  onClose: () => void;
  orderId: number | null;
  paymentUrl: string | null;
  totalAmount: number;
  formatPrice: (price: number) => string;
  onPaymentComplete: () => void;
}

export default function PaymentStatusModal({
  open,
  onClose,
  orderId,
  paymentUrl,
  totalAmount,
  formatPrice,
  onPaymentComplete,
}: PaymentStatusModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("waiting");
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const paymentWindowRef = useRef<Window | null>(null);

  // Start polling when modal opens
  useEffect(() => {
    if (open && orderId && paymentUrl) {
      setPaymentStatus("waiting");
      // Open payment window
      paymentWindowRef.current = window.open(paymentUrl, "_blank");
      // Start polling
      startPollingOrderStatus(orderId);
    }

    return () => {
      stopPolling();
    };
  }, [open, orderId, paymentUrl]);

  const startPollingOrderStatus = (id: number) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await orderService.getOrderDetailById(id);
        const order = response.data;

        if (order) {
          if (order.status === "PROCESSING" || order.status === "PENDING") {
            setPaymentStatus("success");
            stopPolling();
            closePaymentWindow();
          } else if (
            order.status === "PAYMENT_FAILED" ||
            order.status === "CANCELED"
          ) {
            setPaymentStatus("failed");
            stopPolling();
            closePaymentWindow();
          }
        }
      } catch (error) {
        console.error("Error polling order status:", error);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const closePaymentWindow = () => {
    if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
      paymentWindowRef.current.close();
    }
  };

  const handleRetryPayment = () => {
    if (paymentUrl && orderId) {
      setPaymentStatus("waiting");
      paymentWindowRef.current = window.open(paymentUrl, "_blank");
      startPollingOrderStatus(orderId);
    }
  };

  const handleClose = () => {
    stopPolling();
    closePaymentWindow();

    if (paymentStatus === "success") {
      onPaymentComplete();
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && paymentStatus !== "waiting") {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {paymentStatus === "waiting" && "Đang chờ thanh toán"}
            {paymentStatus === "success" && "Thanh toán thành công"}
            {paymentStatus === "failed" && "Thanh toán thất bại"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {/* Waiting Status */}
          {paymentStatus === "waiting" && (
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <CreditCard className="absolute inset-0 m-auto w-10 h-10 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">
                  Vui lòng hướng dẫn khách hàng quét mã QR
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Hệ thống sẽ tự động cập nhật khi thanh toán hoàn tất
                </p>
              </div>
              {orderId && (
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    Mã đơn hàng:{" "}
                    <span className="font-bold text-gray-900">#{orderId}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Tổng tiền:{" "}
                    <span className="font-bold text-red-600">
                      {formatPrice(totalAmount)}
                    </span>
                  </p>
                </div>
              )}
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertDescription className="text-yellow-800 text-xs">
                  Không đóng cửa sổ này cho đến khi thanh toán hoàn tất. Trang
                  thanh toán đã được mở ở tab mới.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Success Status */}
          {paymentStatus === "success" && (
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
                <CheckCircle2 className="absolute inset-0 m-auto w-16 h-16 text-green-500" />
              </div>
              <div>
                <p className="text-green-700 font-bold text-lg">
                  Thanh toán đã hoàn tất!
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Đơn hàng #{orderId} đã được xác nhận
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  ✅ Đơn hàng đã được thanh toán thành công và đang được xử lý.
                </p>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleClose}
              >
                <Check className="w-4 h-4 mr-2" />
                Hoàn tất & Tiếp tục bán hàng
              </Button>
            </div>
          )}

          {/* Failed Status */}
          {paymentStatus === "failed" && (
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>
                <XCircle className="absolute inset-0 m-auto w-16 h-16 text-red-500" />
              </div>
              <div>
                <p className="text-red-700 font-bold text-lg">
                  Thanh toán không thành công!
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Giao dịch đã bị hủy hoặc hết thời gian
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  ❌ Thanh toán thất bại. Vui lòng thử lại hoặc chọn phương thức
                  thanh toán khác.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Đóng
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleRetryPayment}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Thanh toán lại
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
