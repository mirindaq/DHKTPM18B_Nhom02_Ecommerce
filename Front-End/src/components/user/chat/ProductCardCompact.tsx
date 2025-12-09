import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Loader2, Star } from "lucide-react";
import { useNavigate } from "react-router";
import { PUBLIC_PATH } from "@/constants/path";
import type { Product } from "@/types/product.type";
import { useWishlist } from "@/hooks/useWishlist";
import { useUser } from "@/context/UserContext";
import { cartService } from "@/services/cart.service";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";
import LoginModal from "@/components/user/LoginModal";

interface ProductCardCompactProps {
  product: Product;
}

export default function ProductCardCompact({ product }: ProductCardCompactProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { isInWishlist, toggleWishlist, isAdding, isRemoving } = useWishlist();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Tìm variant có giá thấp nhất
  const lowestPriceVariant = product.variants?.reduce((lowest, variant) => {
    if (!lowest) return variant;
    const lowestPrice =
      lowest.oldPrice > 0
        ? lowest.oldPrice * (1 - (lowest.discount || 0) / 100)
        : lowest.price;
    const variantPrice =
      variant.oldPrice > 0
        ? variant.oldPrice * (1 - (variant.discount || 0) / 100)
        : variant.price;
    return variantPrice < lowestPrice ? variant : lowest;
  }, product.variants?.[0]);

  const currentPrice = lowestPriceVariant?.price || 0;
  const oldPrice = lowestPriceVariant?.oldPrice || 0;
  const discountPercent = lowestPriceVariant?.discount || 0;
  const finalPrice =
    oldPrice > 0 ? oldPrice * (1 - discountPercent / 100) : currentPrice;

  const productId = product.id || 0;
  const variantId = lowestPriceVariant?.id || 0;
  const inWishlist = productId > 0 ? isInWishlist(productId) : false;
  const isLoadingWishlist = isAdding || isRemoving;

  const handleProductClick = () => {
    navigate(`${PUBLIC_PATH.HOME}product/${product.slug}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (productId > 0) {
      toggleWishlist(productId);
    }
  };

  const addToCartMutation = useMutation(
    (data: { productVariantId: number; quantity: number }) =>
      cartService.addProductToCart(data),
    {
      onSuccess: () => {
        toast.success("Đã thêm vào giỏ hàng thành công!");
      },
      onError: () => {
        toast.error("Không thể thêm vào giỏ hàng");
      },
    }
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (variantId > 0) {
      addToCartMutation.mutate({
        productVariantId: variantId,
        quantity: 1,
      });
    } else {
      toast.error("Vui lòng chọn biến thể sản phẩm");
    }
  };

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <>
      <div
        className="group relative bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-all duration-200 cursor-pointer overflow-hidden"
        onClick={handleProductClick}
      >
        {/* Product Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              -{discountPercent}%
            </div>
          )}

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleWishlistClick}
            disabled={isLoadingWishlist || productId === 0}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-all ${
              inWishlist ? "text-red-500" : "text-gray-400 hover:text-red-500"
            }`}
            title={inWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            {isLoadingWishlist ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
            )}
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-3 space-y-2">
          {/* Product Name */}
          <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-red-500">
                {formatPrice(finalPrice)}
              </span>
              {oldPrice > 0 && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(oldPrice)}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-gray-600">
                {product.rating || 4.9}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isLoading || variantId === 0}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
            >
              {addToCartMutation.isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Thêm giỏ hàng
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  );
}

