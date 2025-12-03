import { Search, Plus, User, Check, Loader2, CreditCard, Wallet, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { PaymentMethod } from '@/types/order.type'

interface CustomerInfoProps {
  customerPhone: string
  customerName: string
  customerEmail: string
  customerFound: boolean | null
  isSearchingCustomer: boolean
  paymentMethod: PaymentMethod
  note: string
  total: number
  isSubmitting: boolean
  formatPrice: (price: number) => string
  onPhoneChange: (phone: string) => void
  onSearchCustomer: () => void
  onNameChange: (name: string) => void
  onEmailChange: (email: string) => void
  onNoteChange: (note: string) => void
  onOpenAddCustomerModal: () => void
  onOpenPaymentModal: () => void
  onSubmit: () => void
}

export default function CustomerInfo({
  customerPhone,
  customerName,
  customerEmail,
  customerFound,
  isSearchingCustomer,
  paymentMethod,
  note,
  total,
  isSubmitting,
  formatPrice,
  onPhoneChange,
  onSearchCustomer,
  onNameChange,
  onEmailChange,
  onNoteChange,
  onOpenAddCustomerModal,
  onOpenPaymentModal,
  onSubmit
}: CustomerInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5" />
          Thông tin khách hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="customerPhone" className="text-sm font-medium">
              Số điện thoại <span className="text-red-600">*</span>
            </Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="customerPhone"
                placeholder="Nhập số điện thoại"
                value={customerPhone}
                onChange={(e) => onPhoneChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearchCustomer()}
                className="flex-1"
              />
              <Button
                onClick={onSearchCustomer}
                disabled={isSearchingCustomer || !customerPhone.trim()}
                className="bg-blue-600 hover:bg-blue-700 px-4"
              >
                {isSearchingCustomer ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {customerFound === true && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">
                Tìm thấy khách hàng: <strong>{customerName}</strong>
              </AlertDescription>
            </Alert>
          )}

          {customerFound === false && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-yellow-800 text-sm flex items-center justify-between">
                <span>Không tìm thấy khách hàng. Vui lòng tạo mới.</span>
                <Button
                  size="sm"
                  onClick={onOpenAddCustomerModal}
                  className="bg-yellow-600 hover:bg-yellow-700 h-7 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Tạo khách hàng
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {customerFound === true && (
            <>
              <div>
                <Label htmlFor="customerName" className="text-sm font-medium">
                  Tên khách hàng
                </Label>
                <Input
                  id="customerName"
                  value={customerName}
                  disabled
                  className="mt-1.5 bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="customerEmail" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="customerEmail"
                  value={customerEmail || 'Chưa có email'}
                  disabled
                  className="mt-1.5 bg-gray-100"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="note" className="text-sm font-medium">
              Ghi chú
            </Label>
            <Textarea
              id="note"
              placeholder="Nhập ghi chú đơn hàng..."
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={3}
              className="mt-1.5"
            />
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium mb-2 block">Phương thức thanh toán</Label>
            <Button
              variant="outline"
              className="w-full justify-between h-auto p-4 border-2 hover:border-blue-400"
              onClick={onOpenPaymentModal}
            >
              <div className="flex items-center gap-3">
                {paymentMethod === 'CASH_ON_DELIVERY' ? (
                  <>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">Tiền mặt</div>
                      <div className="text-xs text-gray-500">Thanh toán tại quầy</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">VNPay</div>
                      <div className="text-xs text-gray-500">Quét mã QR</div>
                    </div>
                  </>
                )}
              </div>
              <span className="text-gray-400 text-xl">›</span>
            </Button>
          </div>

          <Button
            className="w-full bg-red-600 hover:bg-red-700 h-12 text-base font-bold shadow-lg"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang xử lý...
              </span>
            ) : (
              <>
                <Package className="w-5 h-5 mr-2" />
                Tạo đơn hàng - {formatPrice(total)}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

