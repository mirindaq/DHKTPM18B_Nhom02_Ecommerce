import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@/hooks";
import { purchaseOrderService } from "@/services/purchase-order.service";
import type { PurchaseOrder } from "@/types/purchase-order.type";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return dateString;
};

export default function PurchaseOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: purchaseOrderData, isLoading } = useQuery<{ data: PurchaseOrder }>(
    () => purchaseOrderService.getPurchaseOrderById(Number(id)),
    {
      queryKey: ["purchase-order", id || ""],
      enabled: !!id,
    }
  );

  const purchaseOrder = purchaseOrderData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy phiếu nhập hàng</p>
          <Button
            onClick={() => navigate("/admin/purchase-orders")}
            className="mt-4"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/purchase-orders")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết phiếu nhập hàng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Mã phiếu: PO-{purchaseOrder.id}
          </p>
        </div>
      </div>

      <div className="space-y-8 bg-white rounded-lg border p-6">
        {/* Thông tin nhà cung cấp */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              1
            </span>
            Thông tin nhà cung cấp
          </h3>
          <div className="pl-10">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">
                Thông tin chi tiết
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-medium min-w-[80px]">Tên:</span>
                  <span className="text-gray-900 font-semibold">{purchaseOrder.supplier.name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-medium min-w-[80px]">Mã NCC:</span>
                  <span className="text-gray-700">{purchaseOrder.supplier.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin phiếu nhập */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              2
            </span>
            Thông tin phiếu nhập
          </h3>
          <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-2">Ngày nhập</p>
              <p className="font-semibold text-gray-900">{formatDate(purchaseOrder.purchaseDate)}</p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-2">Người tạo</p>
              <p className="text-gray-900 mt-1 font-semibold">{purchaseOrder.staff.email}</p>
            </div>

            {purchaseOrder.note && (
              <div className="md:col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700 font-medium mb-2">Ghi chú</p>
                <p className="text-sm text-gray-700">{purchaseOrder.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </span>
            Danh sách sản phẩm đã nhập ({purchaseOrder.details.length})
          </h3>
          <div className="pl-10 space-y-3 overflow-x-auto">
            <div className="min-w-[950px]">
              {purchaseOrder.details.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow mb-3"
                >
                  <div className="w-12 flex-shrink-0 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <img
                    src={item.productVariant.productThumbnail}
                    alt={item.productVariant.productName}
                    className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                  />
                  <div className="w-80 space-y-1 flex-shrink-0">
                    <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                      {item.productVariant.productName}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      {item.productVariant.brandName}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-mono">SKU: {item.productVariant.sku}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-shrink-0">
                    <div className="w-24">
                      <p className="text-xs text-gray-600 mb-1.5 whitespace-nowrap">Số lượng</p>
                      <div className="h-10 flex items-center justify-center bg-blue-50 border border-blue-200 rounded-md">
                        <p className="font-bold text-blue-600 text-sm">
                          {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="w-36">
                      <p className="text-xs text-gray-600 mb-1.5 whitespace-nowrap">Đơn giá</p>
                      <div className="h-10 flex items-center justify-end px-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="font-semibold text-gray-700 text-sm">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="w-40">
                      <p className="text-xs text-gray-600 mb-1.5 whitespace-nowrap">Thành tiền</p>
                      <div className="h-10 flex items-center justify-end px-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="font-bold text-green-600 text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pl-10 flex justify-end">
            <div className="w-80 p-5 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">Tổng số lượng:</span>
                  <span className="font-semibold text-gray-900">
                    {purchaseOrder.details.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                  </span>
                </div>
                <div className="border-t border-green-300 pt-2.5 flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-700">Tổng tiền:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(purchaseOrder.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 bg-white rounded-lg border p-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/admin/purchase-orders")}
          className="h-11 px-6"
        >
          Quay lại
        </Button>
      </div>
    </div>
  );
}
