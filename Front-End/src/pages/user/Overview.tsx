import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomBadge } from "@/components/ui/CustomBadge";
import ConfirmDeleteDialog from "@/components/user/ConfirmDeleteDialog";
import {
  ShoppingBag,
  Heart,
  Gift,
  Ticket,
  Copy,
  Check,
  Loader2,
  ChevronRight,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { orderService } from "@/services/order.service";
import { voucherService } from "@/services/voucher.service";
import { wishlistService } from "@/services/wishlist.service";
import { useQuery } from "@/hooks/useQuery";
import { useMutation } from "@/hooks/useMutation";
import type { OrderResponse } from "@/types/order.type";
import type { VoucherAvailableResponse } from "@/types/voucher.type";
import type { WishListResponse, WishListRequest } from "@/types/wishlist.type";
import { toast } from "sonner";
import { USER_PATH, PUBLIC_PATH } from "@/constants/path";

export default function Overview() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Fetch data
  const { data: ordersData, isLoading: loadingOrders } = useQuery(
    () => orderService.getMyOrders(1, 3),
    {
      queryKey: ["recentOrders"],
    }
  );

  const { data: vouchersData, isLoading: loadingVouchers } =
    useQuery<VoucherAvailableResponse[]>(
      () => voucherService.getAvailableVouchers(),
      {
        queryKey: ["availableVouchers"],
      }
    );

  const {
    data: wishlistData,
    isLoading: loadingWishlist,
    refetch: refetchWishlist,
  } = useQuery(() => wishlistService.getMyWishList(), {
    queryKey: ["wishlist"],
  });

  // Mutation để xóa sản phẩm khỏi wishlist
  const removeFromWishlistMutation = useMutation(
    (request: WishListRequest) =>
      wishlistService.removeProductFromWishList(request),
    {
      onSuccess: () => {
        toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích!");
        refetchWishlist();
      },
      onError: (error: any) => {
        console.error("Lỗi khi xóa sản phẩm:", error);
        const errorMsg =
          error.response?.data?.message || "Không thể xóa sản phẩm!";
        toast.error(errorMsg);
      },
    }
  );

  const handleRemoveFromWishlist = (
    e: React.MouseEvent,
    productId: number
  ) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra Card
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      removeFromWishlistMutation.mutate({ productId: productToDelete });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };


  const recentOrders = ordersData?.data?.data?.slice(0, 3) || [];
  const availableVouchers = vouchersData || [];
  const wishlistItems = wishlistData?.data || [];


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatVoucherDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const [copiedVoucherId, setCopiedVoucherId] = useState<number | null>(null);

  const handleCopyVoucherCode = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucherId(id);
    toast.success("Đã sao chép mã giảm giá!");
    setTimeout(() => setCopiedVoucherId(null), 2000);
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === "COMPLETED") {
      return "success" as const;
    }
    if (status === "CANCELED" || status === "FAILED" || status === "PAYMENT_FAILED") {
      return "error" as const;
    }
    if (status === "DELIVERING" || status === "SHIPPED") {
      return "info" as const;
    }
    if (status === "PENDING" || status === "PENDING_PAYMENT") {
      return "warning" as const;
    }
    return "secondary" as const;
  };

  const getStatusLabel = (status: string) => {
    if (status === "COMPLETED") return "Đã nhận hàng";
    if (status === "CANCELED") return "Đã hủy";
    if (status === "FAILED") return "Thất bại";
    if (status === "PAYMENT_FAILED") return "Thanh toán thất bại";
    if (status === "DELIVERING") return "Đang giao";
    if (status === "SHIPPED") return "Đã gửi";
    if (status === "PENDING") return "Chờ xử lý";
    if (status === "PENDING_PAYMENT") return "Chờ thanh toán";
    return status;
  };

  return (
    <div className="space-y-6">
      {/* Delete Wishlist Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={removeFromWishlistMutation.isLoading}
        title="Xóa khỏi danh sách yêu thích"
        description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích không?"
        message="Sau khi xóa, sản phẩm sẽ không còn trong danh sách yêu thích của bạn. Bạn có thể thêm lại bất cứ lúc nào."
      />
      {/* Top Section: Recent Orders and Vouchers */}
      <div className="grid grid-cols-12 gap-6">
        {/* Recent Orders - Left */}
        <div className="col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Đơn hàng gần đây
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(USER_PATH.ORDERS)}
              className="text-red-600 hover:text-red-700"
            >
              Xem tất cả <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>

          {loadingOrders ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                </div>
              </CardContent>
            </Card>
          ) : recentOrders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center py-12">
                <ShoppingBag size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Bạn chưa có đơn hàng nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: OrderResponse) => {
                const firstProduct = order.orderDetails[0];
                const otherProductsCount = order.orderDetails.length - 1;
                return (
                  <Card key={order.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          {firstProduct?.productVariant?.productThumbnail ? (
                            <img
                              src={firstProduct.productVariant.productThumbnail}
                              alt={firstProduct.productVariant.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag size={24} className="text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Order Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {firstProduct?.productVariant?.productName ||
                                  "Sản phẩm"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatPrice(firstProduct?.price || 0)}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-gray-900">
                                {formatPrice(order.finalTotalPrice)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Tổng thanh toán
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                            <span>Mã đơn: {order.id}</span>
                            <span>•</span>
                            <span>{formatDate(order.orderDate)}</span>
                            <span>•</span>
                            <CustomBadge
                              variant={getStatusBadgeVariant(order.status)}
                              size="sm"
                            >
                              {getStatusLabel(order.status)}
                            </CustomBadge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-600">
                              {otherProductsCount > 0 && (
                                <span>Cùng {otherProductsCount} sản phẩm khác</span>
                              )}
                              {order.paymentMethod === "VN_PAY" && (
                                <span className="ml-2">• Đã xuất VAT</span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`${USER_PATH.ORDERS}/${order.id}`)
                              }
                              className="text-red-600 hover:text-red-700 text-xs"
                            >
                              Xem chi tiết{" "}
                              <ChevronRight size={14} className="ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Your Offers - Right */}
        <div className="col-span-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Ưu đãi của bạn
            </h3>
            {availableVouchers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(USER_PATH.VOUCHERS)}
                className="text-red-600 hover:text-red-700"
              >
                Xem tất cả <ArrowRight size={16} className="ml-1" />
              </Button>
            )}
          </div>

          {loadingVouchers ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                </div>
              </CardContent>
            </Card>
          ) : availableVouchers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center py-8">
                <Ticket size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Chưa có ưu đãi</p>
              </CardContent>
            </Card>
          ) : (
            <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2">
              {availableVouchers.map((voucher: VoucherAvailableResponse) => (
                <Card
                  key={voucher.id}
                  className="border-1"
                >
                  <CardContent className="px-3! py-0!">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Gift size={20} className="text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-red-600 text-sm mb-1">
                          {voucher.name || "Ưu đãi đặc biệt"}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Giảm {voucher.discount}% tối đa{" "}
                          {formatPrice(voucher.maxDiscountAmount || 0)}
                        </p>
                        <p className="text-xs text-gray-600 mb-3">
                          HSD: {formatVoucherDate(voucher.endDate)}
                        </p>
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                          <code className="text-sm font-mono font-semibold text-gray-900 flex-1">
                            {voucher.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              handleCopyVoucherCode(voucher.code, voucher.id)
                            }
                          >
                            {copiedVoucherId === voucher.id ? (
                              <Check size={16} className="text-green-600" />
                            ) : (
                              <Copy size={16} className="text-gray-600" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Favorite Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Sản phẩm yêu thích
          </h3>
          {wishlistItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(USER_PATH.WISHLIST)}
              className="text-red-600 hover:text-red-700"
            >
              Xem tất cả <ArrowRight size={16} className="ml-1" />
            </Button>
          )}
        </div>
        <Card>
          <CardContent className="p-6">
            {loadingWishlist ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-red-600" />
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-32 h-32 mx-auto mb-4 bg-pink-50 rounded-full flex items-center justify-center">
                  <Heart size={48} className="text-red-400" />
                </div>
                <p className="text-gray-600 mb-2">
                  Bạn chưa có sản phẩm nào yêu thích? Hãy bắt đầu mua sắm ngay
                  nào!
                </p>
                <Button
                  variant="outline"
                  className="mt-4 text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => navigate(PUBLIC_PATH.HOME)}
                >
                  Mua sắm ngay
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {wishlistItems.slice(0, 4).map((item: WishListResponse) => (
                  <div
                    key={item.id}
                    className="group relative cursor-pointer"
                    onClick={() =>
                      navigate(`${PUBLIC_PATH.HOME}product/${item.productSlug}`)
                    }
                  >
                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleRemoveFromWishlist(e, item.productId)}
                      disabled={removeFromWishlistMutation.isLoading}
                      className="absolute top-2 right-2 z-10 h-7 w-7 p-0 bg-white/90 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Xóa khỏi danh sách yêu thích"
                    >
                      {removeFromWishlistMutation.isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.productName}
                    </p>
                    <p className="text-sm text-red-600 font-semibold">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>


    </div>
  );
}

