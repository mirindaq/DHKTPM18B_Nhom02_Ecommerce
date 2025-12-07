import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket, Calendar, Tag, Copy, Check } from "lucide-react";
import { voucherService } from "@/services/voucher.service";
import type { VoucherAvailableResponse } from "@/types/voucher.type";
import { toast } from "sonner";
import { PUBLIC_PATH } from "@/constants/path";

export default function MyVouchers() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<VoucherAvailableResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const formatCurrency = (amount: number) =>
    amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) ||
    "0 ₫";

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const data = await voucherService.getAvailableVouchers();
        if (data) {
          setVouchers(data);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách voucher:", error);
        toast.error("Không thể tải danh sách mã giảm giá");
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const handleCopyCode = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Đã sao chép mã giảm giá!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách voucher...</p>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="text-center py-12">
          <Ticket size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có mã giảm giá
          </h3>
          <p className="text-gray-500 mb-4">
            Bạn chưa có mã giảm giá nào. Hãy mua sắm để nhận ưu đãi!
          </p>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => navigate(PUBLIC_PATH.HOME)}
          >
            Khám phá sản phẩm
          </Button>
        </div>
      ) : (
          <div className="grid gap-4">
            {vouchers.map((voucher, index) => (
              <Card
                key={`${voucher.id}-${index}`}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Left - Discount Badge */}
                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 flex flex-col items-center justify-center min-w-[140px]">
                      <span className="text-3xl font-bold">
                        {voucher.discount}%
                      </span>
                      <span className="text-sm opacity-90">GIẢM GIÁ</span>
                    </div>

                    {/* Right - Info */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {voucher.name}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <Tag size={14} className="text-red-500" />
                              Giảm tối đa{" "}
                              {formatCurrency(voucher.maxDiscountAmount)}
                            </p>
                            <p className="flex items-center gap-2">
                              <Ticket size={14} className="text-red-500" />
                              Đơn tối thiểu{" "}
                              {formatCurrency(voucher.minOrderAmount)}
                            </p>
                            <p className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-400" />
                              HSD: {formatDate(voucher.startDate)} -{" "}
                              {formatDate(voucher.endDate)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          {voucher.code && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() =>
                                handleCopyCode(voucher.code, voucher.id)
                              }
                            >
                              {copiedId === voucher.id ? (
                                <>
                                  <Check size={14} className="text-green-600" />
                                  Đã sao chép
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  {voucher.code}
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            className="bg-red-600 hover:bg-red-700"
                            size="sm"
                            onClick={() => navigate(PUBLIC_PATH.HOME)}
                          >
                            Dùng ngay
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
      )}
    </div>
  );
}
