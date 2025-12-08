import { ShoppingCart, Trash2, Ticket, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomBadge } from '@/components/ui/CustomBadge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CartItemComponent from '@/components/staff/sell/CartItem'
import type { VoucherAvailableResponse } from '@/types/voucher.type'

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

interface CartProps {
  cart: CartItem[]
  customerFound: boolean | null
  isLoadingVouchers: boolean
  applicableVouchers: VoucherAvailableResponse[]
  selectedVoucher: VoucherAvailableResponse | null
  selectedVoucherId: number | null
  voucherDiscount: number
  subtotal: number
  total: number
  formatPrice: (price: number) => string
  onClearCart: () => void
  onUpdateQuantity: (productVariantId: number, quantity: number) => void
  onRemoveItem: (productVariantId: number) => void
  onOpenVoucherModal: () => void
}

export default function Cart({
  cart,
  customerFound,
  isLoadingVouchers,
  applicableVouchers,
  selectedVoucher,
  selectedVoucherId,
  voucherDiscount,
  subtotal,
  total,
  formatPrice,
  onClearCart,
  onUpdateQuantity,
  onRemoveItem,
  onOpenVoucherModal
}: CartProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Giỏ hàng ({cart.length})
          </CardTitle>
          {cart.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Xóa hết
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {cart.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingCart className="w-20 h-20 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">Giỏ hàng trống</p>
            <p className="text-xs mt-1">Tìm và thêm sản phẩm vào giỏ</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {cart.map((item) => (
                <CartItemComponent
                  key={item.productVariantId}
                  item={item}
                  formatPrice={formatPrice}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemoveItem}
                />
              ))}
            </div>

            <Separator />

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              
              {customerFound && (
                <button
                  type="button"
                  onClick={() => applicableVouchers.length > 0 && onOpenVoucherModal()}
                  className={`w-full flex justify-between items-center text-sm py-2 px-3 rounded-lg border transition-colors ${
                    selectedVoucher 
                      ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  } ${applicableVouchers.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="flex items-center gap-2">
                    {isLoadingVouchers ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                        <span className="text-gray-500">Đang tìm voucher...</span>
                      </>
                    ) : selectedVoucherId === -1 ? (
                      <>
                        <X className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Không sử dụng voucher</span>
                      </>
                    ) : selectedVoucher ? (
                      <>
                        <Ticket className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium">{selectedVoucher.code}</span>
                        <CustomBadge variant="success" size="sm">
                          -{selectedVoucher.discount}%
                        </CustomBadge>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">
                          {applicableVouchers.length > 0 
                            ? `${applicableVouchers.length} voucher khả dụng` 
                            : 'Không có voucher'}
                        </span>
                      </>
                    )}
                  </div>
                  {selectedVoucher ? (
                    <span className="font-semibold text-green-600">-{formatPrice(voucherDiscount)}</span>
                  ) : applicableVouchers.length > 0 && selectedVoucherId !== -1 ? (
                    <span className="text-gray-400 text-xs">Chọn voucher ›</span>
                  ) : applicableVouchers.length > 0 ? (
                    <span className="text-gray-400 text-xs">Thay đổi ›</span>
                  ) : null}
                </button>
              )}
              
              <div className="flex justify-between items-center py-3 px-3 bg-red-50 rounded-lg border border-red-200">
                <span className="font-bold text-gray-800">Tổng cộng:</span>
                <span className="text-xl font-bold text-red-600">{formatPrice(total)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

