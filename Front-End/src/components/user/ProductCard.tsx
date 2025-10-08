import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Star } from "lucide-react"
import { useNavigate } from "react-router"
import { PUBLIC_PATH } from "@/constants/path"
import type { Product } from "@/types/product.type"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const firstVariant = product.variants?.[0]
  const currentPrice = firstVariant?.price || 0
  const oldPrice = firstVariant?.oldPrice || 0
  const discountPercent = product.discount || 0

  const finalPrice = oldPrice > 0 ? oldPrice * (1 - discountPercent / 100) : currentPrice

  const handleProductClick = () => {
    navigate(`${PUBLIC_PATH.HOME}product/${product.slug}`)
  }

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <Card 
      className="group relative overflow-hidden bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleProductClick}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10">
        {discountPercent > 0 && (
          <Badge className="bg-red-500 text-white font-bold text-xs px-2 py-1 rounded-r-lg">
            Giảm {discountPercent}%
          </Badge>
        )}
      </div>
      
      <div className="absolute top-2 right-2 z-10">
        <Badge className="bg-blue-100 text-blue-600 font-bold text-xs px-2 py-1 rounded-l-lg">
          Trả góp 0%
        </Badge>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-red-500">
              {formatPrice(finalPrice)}
            </span>
            {oldPrice > 0 && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(oldPrice)}
              </span>
            )}
          </div>

          {/* Smember Discount */}
          <div className="bg-blue-50 rounded-md px-2 py-1">
            <span className="text-sm text-blue-600 font-medium">
              Smember giảm đến {formatPrice(finalPrice * 0.01)}
            </span>
          </div>

          {/* Installment Info */}
          <p className="text-sm text-gray-600 leading-relaxed">
            Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6 tháng
          </p>
        </div>

        {/* Rating and Like */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-sm">{product.rating || 4.9}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 p-2"
          >
            <Heart className="w-4 h-4 mr-1" />
            <span className="text-sm">Yêu thích</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
