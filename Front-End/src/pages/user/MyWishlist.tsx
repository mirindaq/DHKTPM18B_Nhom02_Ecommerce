import { useState } from "react";
import { useNavigate } from "react-router";
import { wishlistService } from "@/services/wishlist.service";
import { useQuery } from "@/hooks/useQuery";
import { useMutation } from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ConfirmDeleteDialog from "@/components/user/ConfirmDeleteDialog";
import {
  Heart,
  Trash2,
  Loader2,
  ShoppingCart,
  Star,
} from "lucide-react";
import type { WishListResponse, WishListRequest } from "@/types/wishlist.type";
import { PUBLIC_PATH } from "@/constants/path";
import { toast } from "sonner";

export default function MyWishlist() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Fetch wishlist
  const {
    data: wishlistData,
    isLoading: loading,
    refetch: refetchWishlist,
    error: wishlistError,
  } = useQuery<{ data: WishListResponse[] }>(
    () => wishlistService.getMyWishList(),
    {
      queryKey: ["wishlist"],
      onError: (err) => {
        console.error("Lỗi khi tải wishlist:", err);
        const error = err as any;
        const errorMsg =
          error.response?.data?.message || "Không thể tải danh sách yêu thích!";
        toast.error(errorMsg);
      },
    }
  );

  const wishlistItems = wishlistData?.data || [];

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

  const handleRemoveFromWishlist = (e: React.MouseEvent, productId: number) => {
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

  const handleProductClick = (productSlug: string) => {
    navigate(`${PUBLIC_PATH.HOME}product/${productSlug}`);
  };

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-4" />
          <p className="text-gray-600">Đang tải danh sách yêu thích...</p>
        </div>
      ) : wishlistError ? (
        <Alert className="bg-red-50 border-red-200">
          <AlertTitle>Có lỗi xảy ra</AlertTitle>
          <AlertDescription>
            Không thể tải danh sách yêu thích. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa có sản phẩm yêu thích nào
          </h3>
          <p className="text-gray-600 mb-6">
            Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng tìm lại sau
          </p>
          <Button
            onClick={() => navigate(PUBLIC_PATH.HOME)}
            className="inline-flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Tiếp tục mua sắm</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {wishlistItems.map((item) => (
            <Card
              key={item.id}
              className="group relative overflow-hidden bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleProductClick(item.productSlug)}
            >
              {/* Remove button */}
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleRemoveFromWishlist(e, item.productId)}
                  disabled={removeFromWishlistMutation.isLoading}
                  className="h-7 w-7 p-0 bg-white/90 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-full shadow-sm backdrop-blur-sm"
                  title="Xóa khỏi danh sách yêu thích"
                >
                  {removeFromWishlistMutation.isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>

              {/* Badge */}
              <div className="absolute top-2 left-2 z-10">
                <CustomBadge variant="info" size="sm" className="font-bold rounded-r-lg">
                  Trả góp 0%
                </CustomBadge>
              </div>

              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://via.placeholder.com/300x300?text=No+Image";
                  }}
                />
              </div>

              <CardContent className="p-3 space-y-2">
                {/* Product Name */}
                <h3 className="font-bold text-base text-gray-900 line-clamp-2 min-h-[3rem] hover:text-red-600 transition-colors">
                  {item.productName}
                </h3>

                {/* Price Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-red-500">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  {/* Smember Discount */}
                  <div className="bg-blue-50 rounded-md px-2 py-1">
                    <span className="text-xs text-blue-600 font-medium">
                      Smember giảm đến {formatPrice(item.price * 0.01)}
                    </span>
                  </div>

                  {/* Installment Info */}
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6 tháng
                  </p>
                </div>

                {/* Rating and Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-xs">4.9</span>
                  </div>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(item.productSlug);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 px-2"
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Mua ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
