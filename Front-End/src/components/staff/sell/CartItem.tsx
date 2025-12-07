import { Plus, Minus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CartItem {
  productVariantId: number
  productName: string
  productImage: string
  variantInfo: string
  price: number
  oldPrice: number
  quantity: number
  stock: number
}

interface CartItemProps {
  item: CartItem
  formatPrice: (price: number) => string
  onUpdateQuantity: (productVariantId: number, quantity: number) => void
  onRemove: (productVariantId: number) => void
}

export default function CartItemComponent({
  item,
  formatPrice,
  onUpdateQuantity,
  onRemove
}: CartItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
      <div className="flex gap-3 mb-3">
        <img
          src={item.productImage}
          alt={item.productName}
          className="w-16 h-16 object-cover rounded border"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold line-clamp-2 mb-1 text-gray-800">
            {item.productName}
          </h4>
          <p className="text-xs text-gray-500 mb-1">{item.variantInfo}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-red-600">
              {formatPrice(item.price)}
            </span>
            {item.oldPrice > item.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(item.oldPrice)}
              </span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(item.productVariantId)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center justify-between bg-white rounded p-2 border">
        <span className="text-xs font-medium text-gray-600">Số lượng:</span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateQuantity(item.productVariantId, item.quantity - 1)}
            className="w-7 h-7 p-0"
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateQuantity(item.productVariantId, item.quantity + 1)}
            className="w-7 h-7 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="mt-2 text-right">
        <span className="text-xs text-gray-500">Thành tiền: </span>
        <span className="text-sm font-bold text-gray-800">
          {formatPrice(item.price * item.quantity)}
        </span>
      </div>
    </div>
  )
}

