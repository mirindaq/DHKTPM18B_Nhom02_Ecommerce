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
import CartItemSkeleton, { CartSummarySkeleton } from '@/components/user/CartItemSkeleton'

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
      
      // Optimistic update - cập nhật UI trước
      setCart(prevCart => {
        if (!prevCart) return prevCart
        
        return {
          ...prevCart,
          items: prevCart.items.map(item => 
            item.productVariantId === productVariantId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        }
      })

      // Gọi API cập nhật
      await cartService.updateCartItemQuantity(productVariantId, newQuantity)
      
      toast.success('Đã cập nhật số lượng')
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng:', error)
      
      // Rollback nếu có lỗi
      await loadCart()
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
      setUpdatingItems(prev => new Set(prev).add(productVariantId))
      
      // Optimistic update - xóa khỏi UI trước
      setCart(prevCart => {
        if (!prevCart) return prevCart
        
        return {
          ...prevCart,
          items: prevCart.items.filter(item => item.productVariantId !== productVariantId)
        }
      })
      
      setSelectedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productVariantId)
        return newSet
      })

      // Gọi API xóa
      await cartService.removeProductFromCart(productVariantId)
      
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error)
      
      // Rollback nếu có lỗi
      await loadCart()
      toast.error('Không thể xóa sản phẩm')
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productVariantId)
        return newSet
      })
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

    const selectedItemsArray = Array.from(selectedItems)
    
    try {
      // Optimistic update - xóa khỏi UI trước
      setCart(prevCart => {
        if (!prevCart) return prevCart
        
        return {
          ...prevCart,
          items: prevCart.items.filter(item => !selectedItems.has(item.productVariantId))
        }
      })
      
      setSelectedItems(new Set())

      // Gọi API xóa tất cả
      await Promise.all(
        selectedItemsArray.map(productVariantId => 
          cartService.removeProductFromCart(productVariantId)
        )
      )
      
      toast.success(`Đã xóa ${selectedItemsArray.length} sản phẩm`)
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error)
      
      // Rollback nếu có lỗi
      await loadCart()
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
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>

        {/* Cart Actions Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>

        {/* Cart Items Skeleton */}
        <div className="space-y-4 mb-8">
          {[...Array(3)].map((_, index) => (
            <CartItemSkeleton key={index} />
          ))}
        </div>

        {/* Cart Summary Skeleton */}
        <CartSummarySkeleton />
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Giỏ hàng của bạn</h1>
        <p className="text-gray-600">{cart.items.length} sản phẩm trong giỏ hàng</p>
      </div>

      {/* Cart Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6 transition-all duration-300">
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
              className="flex items-center space-x-2 transition-all duration-300 hover:scale-105 animate-in slide-in-from-right-5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa đã chọn ({selectedItems.size})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-8">
        {cart.items.map((item, index) => (
          <div 
            key={item.productVariantId} 
            className={`bg-white rounded-lg shadow-sm border p-6 transition-all duration-300 animate-in slide-in-from-bottom-4 ${
              updatingItems.has(item.productVariantId) 
                ? 'opacity-50 pointer-events-none' 
                : 'opacity-100'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start space-x-4">
              {/* Checkbox */}
              <Checkbox
                checked={selectedItems.has(item.productVariantId)}
                onCheckedChange={(checked) => handleSelectItem(item.productVariantId, checked as boolean)}
                disabled={updatingItems.has(item.productVariantId)}
              />

              {/* Product Image */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
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
                    <Badge variant="destructive" className="text-xs animate-pulse">
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
                  <div className="flex items-center border rounded-lg bg-white">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(item.productVariantId, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updatingItems.has(item.productVariantId)}
                      className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200"
                    >
                      {updatingItems.has(item.productVariantId) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <div className="px-3 py-1 min-w-[60px] text-center font-medium">
                      {item.quantity}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(item.productVariantId, item.quantity + 1)}
                      disabled={updatingItems.has(item.productVariantId)}
                      className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200"
                    >
                      {updatingItems.has(item.productVariantId) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
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
                  disabled={updatingItems.has(item.productVariantId)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                >
                  {updatingItems.has(item.productVariantId) ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-1" />
                  )}
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6 transition-all duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold mb-2">Tổng cộng</h3>
            <p className="text-gray-600">
              {selectedItems.size} sản phẩm được chọn
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600 mb-2 transition-all duration-300">
              {formatPrice(calculateTotal())}
            </div>
            
            <Button 
              size="lg" 
              className="w-full transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
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
