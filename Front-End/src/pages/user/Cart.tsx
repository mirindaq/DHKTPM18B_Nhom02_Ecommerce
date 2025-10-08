import { useState, useEffect } from 'react'
import { cartService } from '@/services/cart.service'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Loader2,
  CheckCircle
} from 'lucide-react'
import type { Cart } from '@/types/cart.type'
import { toast } from 'sonner'

export default function Cart() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set())

  const loadCart = async () => {
    try {
      setLoading(true)
      const response = await cartService.getCart()
      setCart(response.data)
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng:', error)
      toast.error('Không thể tải giỏ hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  const handleQuantityChange = async (productVariantId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      setUpdatingItems(prev => new Set(prev).add(productVariantId))
      
      // Sử dụng API cập nhật số lượng trực tiếp
      await cartService.updateCartItemQuantity(productVariantId, newQuantity)

      // Reload cart
      await loadCart()
      toast.success('Đã cập nhật số lượng')
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng:', error)
      toast.error('Không thể cập nhật số lượng')
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productVariantId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (productVariantId: number) => {
    try {
      await cartService.removeProductFromCart(productVariantId)
      setSelectedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productVariantId)
        return newSet
      })
      await loadCart()
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error)
      toast.error('Không thể xóa sản phẩm')
    }
  }

  const handleSelectItem = (productVariantId: number, checked: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(productVariantId)
      } else {
        newSet.delete(productVariantId)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked && cart?.items) {
      setSelectedItems(new Set(cart.items.map(item => item.productVariantId)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleRemoveSelected = async () => {
    if (selectedItems.size === 0) return

    try {
      for (const productVariantId of selectedItems) {
        await cartService.removeProductFromCart(productVariantId)
      }
      setSelectedItems(new Set())
      await loadCart()
      toast.success(`Đã xóa ${selectedItems.size} sản phẩm`)
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error)
      toast.error('Không thể xóa sản phẩm')
    }
  }

  const calculateTotal = () => {
    if (!cart?.items) return 0
    return cart.items
      .filter(item => selectedItems.has(item.productVariantId))
      .reduce((total, item) => {
        const discountedPrice = item.price * (1 - item.discount / 100)
        return total + (discountedPrice * item.quantity)
      }, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <Button onClick={() => window.location.href = '/'}>
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Giỏ hàng của bạn</h1>
        <p className="text-gray-600">{cart.items.length} sản phẩm trong giỏ hàng</p>
      </div>

      {/* Cart Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={selectedItems.size === cart.items.length && cart.items.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="font-medium">Chọn tất cả ({cart.items.length})</span>
          </div>
          
          {selectedItems.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveSelected}
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa đã chọn ({selectedItems.size})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-8">
        {cart.items.map((item) => (
          <div key={item.productVariantId} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start space-x-4">
              {/* Checkbox */}
              <Checkbox
                checked={selectedItems.has(item.productVariantId)}
                onCheckedChange={(checked) => handleSelectItem(item.productVariantId, checked as boolean)}
              />

              {/* Product Image */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                  {item.productName}
                </h3>
                <p className="text-sm text-gray-500 mb-2">SKU: {item.sku}</p>
                
                <div className="flex items-center space-x-2 mb-3">
                  {item.discount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      -{item.discount}%
                    </Badge>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2 mb-4">
                  {item.discount > 0 && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(item.price)}
                    </span>
                  )}
                  <span className="text-lg font-semibold text-red-600">
                    {formatPrice(item.price * (1 - item.discount / 100))}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Số lượng:</span>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(item.productVariantId, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updatingItems.has(item.productVariantId)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <div className="px-3 py-1 min-w-[60px] text-center">
                      {updatingItems.has(item.productVariantId) ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        item.quantity
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(item.productVariantId, item.quantity + 1)}
                      disabled={updatingItems.has(item.productVariantId)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end space-y-2">
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatPrice((item.price * (1 - item.discount / 100)) * item.quantity)}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(item.productVariantId)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold mb-2">Tổng cộng</h3>
            <p className="text-gray-600">
              {selectedItems.size} sản phẩm được chọn
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {formatPrice(calculateTotal())}
            </div>
            
            <Button 
              size="lg" 
              className="w-full"
              disabled={selectedItems.size === 0}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Thanh toán ({selectedItems.size} sản phẩm)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
