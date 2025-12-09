import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Home, Package } from "lucide-react";

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  // Lấy thông tin từ URL params
  const vnpResponseCode = searchParams.get("vnp_ResponseCode");
  const orderId = searchParams.get("orderId");
  const vnpTransactionNo = searchParams.get("vnp_TransactionNo");
  const vnpTxnRef = searchParams.get("vnp_TxnRef");
  const vnpAmount = searchParams.get("vnp_Amount");
  const vnpBankCode = searchParams.get("vnp_BankCode");
  const vnpPayDate = searchParams.get("vnp_PayDate");

  // Check xem thanh toán thành công hay thất bại
  const isSuccess = vnpResponseCode === "00";

  // Format số tiền (VNPAY trả về amount * 100)
  const formatAmount = (amount: string | null) => {
    if (!amount) return "0 ₫";
    const amountNumber = parseInt(amount) / 100;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amountNumber);
  };

  // Format ngày giờ thanh toán
  const formatPayDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    // Format: YYYYMMDDHHmmss -> DD/MM/YYYY HH:mm:ss
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  // Auto redirect về trang chủ sau 10 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardContent className="p-8">
          {/* Icon và Title */}
          <div className="text-center mb-8">
            {isSuccess ? (
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25"></div>
                  <CheckCircle2 className="w-24 h-24 text-green-500 relative" />
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse opacity-25"></div>
                  <XCircle className="w-24 h-24 text-red-500 relative" />
                </div>
              </div>
            )}

            <h1
              className={`text-3xl font-bold mb-2 ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại!"}
            </h1>
            <p className="text-gray-600">
              {isSuccess
                ? "Đơn hàng của bạn đã được xác nhận và đang được xử lý"
                : "Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác"}
            </p>
          </div>

          {/* Thông tin giao dịch */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
            <h2 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">
              Thông tin giao dịch
            </h2>

            {orderId && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Mã đơn hàng:</span>
                <span className="font-bold text-gray-900">#{orderId}</span>
              </div>
            )}

            {vnpAmount && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Số tiền:</span>
                <span className="font-bold text-lg text-red-600">
                  {formatAmount(vnpAmount)}
                </span>
              </div>
            )}

            {vnpTransactionNo && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">
                  Mã giao dịch VNPAY:
                </span>
                <span className="font-mono text-sm text-gray-900">
                  {vnpTransactionNo}
                </span>
              </div>
            )}

            {vnpTxnRef && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">
                  Mã tham chiếu:
                </span>
                <span className="font-mono text-sm text-gray-900">
                  {vnpTxnRef}
                </span>
              </div>
            )}

            {vnpBankCode && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Ngân hàng:</span>
                <span className="font-semibold text-gray-900 uppercase">
                  {vnpBankCode}
                </span>
              </div>
            )}

            {vnpPayDate && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">
                  Thời gian thanh toán:
                </span>
                <span className="text-gray-900">
                  {formatPayDate(vnpPayDate)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 pt-4 border-t">
              <span className="text-gray-600 font-medium">Trạng thái:</span>
              <span
                className={`px-4 py-1.5 rounded-full font-bold text-sm ${
                  isSuccess
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}
              >
                {isSuccess ? "Thành công" : "Thất bại"}
              </span>
            </div>
          </div>

          {/* Message box */}
          {isSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm leading-relaxed">
                ✅ Cảm ơn bạn đã mua sắm tại <b>EcomStore</b>! Chúng tôi sẽ xử
                lý đơn hàng của bạn trong thời gian sớm nhất. Bạn có thể kiểm
                tra trạng thái đơn hàng trong phần "Đơn hàng của tôi".
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm leading-relaxed mb-2">
                ❌ Giao dịch không thành công do:{" "}
                <b>
                  {vnpResponseCode === "24"
                    ? "Giao dịch bị hủy"
                    : vnpResponseCode === "07"
                    ? "Trừ tiền thành công nhưng giao dịch bị nghi ngờ"
                    : vnpResponseCode === "09"
                    ? "Giao dịch không thành công do thẻ chưa đăng ký dịch vụ"
                    : vnpResponseCode === "10"
                    ? "Giao dịch không thành công do xác thực thông tin thẻ sai quá số lần quy định"
                    : vnpResponseCode === "11"
                    ? "Giao dịch không thành công do đã hết hạn chờ thanh toán"
                    : vnpResponseCode === "12"
                    ? "Giao dịch không thành công do thẻ bị khóa"
                    : vnpResponseCode === "13"
                    ? "Giao dịch không thành công do nhập sai mật khẩu xác thực giao dịch (OTP)"
                    : vnpResponseCode === "51"
                    ? "Tài khoản không đủ số dư"
                    : vnpResponseCode === "65"
                    ? "Tài khoản vượt quá hạn mức giao dịch trong ngày"
                    : "Lỗi không xác định"}
                </b>
              </p>
              <p className="text-red-700 text-xs">
                Vui lòng thử lại hoặc liên hệ hotline{" "}
                <b className="font-semibold">1800.2097</b> để được hỗ trợ.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 text-base font-semibold border-2"
              onClick={() => navigate("/")}
            >
              <Home className="w-5 h-5 mr-2" />
              Về trang chủ
            </Button>

            {isSuccess && orderId && (
              <Button
                className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                onClick={() => navigate(`/profile/orders`)}
              >
                <Package className="w-5 h-5 mr-2" />
                Xem đơn hàng
              </Button>
            )}

            {!isSuccess && (
              <Button
                className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                onClick={() => navigate("/cart")}
              >
                Thử lại
              </Button>
            )}
          </div>

          {/* Auto redirect countdown */}
          <div className="text-center mt-6 pt-6 border-t">
            <p className="text-sm text-gray-500">
              Tự động chuyển về trang chủ sau{" "}
              <span className="font-bold text-red-600">{countdown}</span> giây
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
