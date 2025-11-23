import { useNavigate } from "react-router";
import { wishlistService } from "@/services/wishlist.service";
import { useQuery } from "@/hooks/useQuery";
import { useMutation } from "@/hooks/useMutation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    
    if (
      !window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?")
    )
      return;

    removeFromWishlistMutation.mutate({ productId });
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Danh sách yêu thích</h1>
        <p className="text-gray-600">
          Quản lý sản phẩm yêu thích của bạn ({wishlistItems.length} sản phẩm)
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-4" />
              <p className="text-gray-600">Đang tải danh sách yêu thích...</p>
            </div>
          </CardContent>
        </Card>
      ) : wishlistError ? (
        <Alert className="bg-red-50 border-red-200">
          <AlertTitle>Có lỗi xảy ra</AlertTitle>
          <AlertDescription>
            Không thể tải danh sách yêu thích. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      ) : wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
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
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-full shadow-sm backdrop-blur-sm"
                  title="Xóa khỏi danh sách yêu thích"
                >
                  {removeFromWishlistMutation.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Badge */}
              <div className="absolute top-2 left-2 z-10">
                <Badge className="bg-blue-100 text-blue-600 font-bold text-xs px-2 py-1 rounded-r-lg">
                  Trả góp 0%
                </Badge>
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

              <CardContent className="p-4 space-y-3">
                {/* Product Name */}
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 min-h-[3.5rem] hover:text-red-600 transition-colors">
                  {item.productName}
                </h3>

                {/* Price Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-500">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  {/* Smember Discount */}
                  <div className="bg-blue-50 rounded-md px-2 py-1">
                    <span className="text-sm text-blue-600 font-medium">
                      Smember giảm đến {formatPrice(item.price * 0.01)}
                    </span>
                  </div>

                  {/* Installment Info */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6 tháng
                  </p>
                </div>

                {/* Rating and Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-sm">4.9</span>
                  </div>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(item.productSlug);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
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
