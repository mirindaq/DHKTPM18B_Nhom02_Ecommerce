import { CustomBadge } from '@/components/ui/CustomBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Product } from '@/types/product.type'

interface ProductSearchResultsProps {
  products: Product[]
  formatPrice: (price: number) => string
  onProductClick: (product: Product) => void
}

export default function ProductSearchResults({
  products,
  formatPrice,
  onProductClick
}: ProductSearchResultsProps) {
  if (products.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Kết quả tìm kiếm ({products.length} sản phẩm)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[700px] overflow-y-auto pr-2">
          {products.map((product) => {
            const firstVariant = product.variants?.[0]

            return (
              <div
                key={product.id}
                className="border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group bg-white"
                onClick={() => onProductClick(product)}
              >
                <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-50">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {firstVariant && firstVariant.oldPrice > firstVariant.price && (
                    <CustomBadge variant="error" size="sm" className="absolute top-2 left-2 text-white">
                      -{Math.round((1 - firstVariant.price / firstVariant.oldPrice) * 100)}%
                    </CustomBadge>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <h4 className="text-sm font-medium line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600">
                    {product.name}
                  </h4>
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-bold text-red-600">
                      {formatPrice(firstVariant?.price || 0)}
                    </span>
                    {firstVariant && firstVariant.oldPrice > firstVariant.price && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(firstVariant.oldPrice)}
                      </span>
                    )}
                  </div>
                  <CustomBadge variant="secondary" size="sm">
                    {product.variants?.length || 0} biến thể
                  </CustomBadge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

