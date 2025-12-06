import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { PUBLIC_PATH } from "@/constants/path";
import type { Product } from "@/types/product.type";
import { useWishlist } from "@/hooks/useWishlist";
import { useUser } from "@/context/UserContext";
import LoginModal from "@/components/user/LoginModal";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
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
  const inWishlist = productId > 0 ? isInWishlist(productId) : false;
  const isLoading = isAdding || isRemoving;

  // Lấy các variant values để hiển thị (giới hạn 3 values)
  const variantOptions =
    product.variants
      ?.slice(0, 3)
      .flatMap((variant) =>
        variant.productVariantValues.map((pv) => pv.variantValue.value)
      )
      .filter((value, index, self) => self.indexOf(value) === index)
      .slice(0, 3) || [];

  const handleProductClick = () => {
    navigate(`${PUBLIC_PATH.HOME}product/${product.slug}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra Card

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (productId > 0) {
      toggleWishlist(productId);
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
    <div
      className="group relative overflow-hidden bg-white rounded-sm border border-gray-200 hover:border-blue-400 transition-all duration-200 cursor-pointer"
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="relative aspect-[5/4] overflow-hidden bg-gray-50">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200 p-2"
        />

        {/* Badges overlay */}
        {discountPercent > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-sm font-semibold px-2.5 py-1 rounded">
            -{discountPercent}%
          </Badge>
        )}

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleWishlistClick}
          disabled={isLoading || productId === 0}
          className={`absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-all ${
            inWishlist ? "text-red-500" : "text-gray-400 hover:text-red-500"
          }`}
          title={inWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Heart className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`} />
          )}
        </Button>
      </div>

      <div className="p-4 space-y-2.5">
        {/* Product Name */}
        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 leading-snug min-h-[3.25rem]">
          {product.name}
        </h3>

        {/* Variant Options */}
        {variantOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {variantOptions.map((option, index) => (
              <span
                key={index}
                className="inline-flex items-center text-xs text-gray-700 bg-white border border-gray-300 px-2 py-0.5 rounded"
              >
                {option}
              </span>
            ))}
          </div>
        )}

        {/* Price Section */}
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-bold text-red-500">
              {formatPrice(finalPrice)}
            </span>
            {oldPrice > 0 && (
              <span className="text-base text-gray-400 line-through">
                {formatPrice(oldPrice)}
              </span>
            )}
          </div>

          {/* Smember & Installment */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium">
              Smember -{formatPrice(finalPrice * 0.01)}
            </span>
            <span className="inline-flex items-center text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-medium">
              Trả góp 0%
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 pt-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-base font-medium text-gray-600">
            {product.rating || 4.9}
          </span>
          <span className="text-sm text-gray-400 ml-1">| Đã bán 1k+</span>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}
