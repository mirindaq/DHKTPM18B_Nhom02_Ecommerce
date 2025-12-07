import { CustomBadge } from '@/components/ui/CustomBadge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Product, ProductVariantResponse } from '@/types/product.type'

interface CartItem {
  productVariantId: number
  quantity: number
}

interface VariantSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  cart: CartItem[]
  formatPrice: (price: number) => string
  onSelectVariant: (variant: ProductVariantResponse) => void
}

export default function VariantSelectionModal({
  open,
  onOpenChange,
  product,
  cart,
  formatPrice,
  onSelectVariant
}: VariantSelectionModalProps) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Chọn biến thể sản phẩm</DialogTitle>
          <p className="text-sm text-gray-600 mt-2">{product.name}</p>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex gap-4 mb-6 pb-6 border-b">
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-24 h-24 object-cover rounded-lg border"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600">
                Có {product.variants?.length || 0} biến thể khả dụng
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Chọn cấu hình:</h4>
            {product.variants?.map((variant) => {
              const variantInfo = variant.productVariantValues
                .map(pv => pv.variantValue.value)
                .join(' - ')
              const inCart = cart.find(item => item.productVariantId === variant.id)
              const hasDiscount = variant.oldPrice > variant.price

              return (
                <button
                  key={variant.id}
                  className="w-full border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                  onClick={() => onSelectVariant(variant)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">{variantInfo}</span>
                        {hasDiscount && (
                          <CustomBadge variant="error" size="sm" className="text-white">
                            -{Math.round((1 - variant.price / variant.oldPrice) * 100)}%
                          </CustomBadge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-red-600">
                          {formatPrice(variant.price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(variant.oldPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    {inCart && (
                      <CustomBadge variant="success">
                        Trong giỏ: {inCart.quantity}
                      </CustomBadge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">SKU: {variant.sku}</span>
                    <span className={`font-medium ${variant.stock > 10 ? 'text-green-600' : variant.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                      Kho: {variant.stock}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

