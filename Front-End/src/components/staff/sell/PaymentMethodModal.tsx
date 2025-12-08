import { CreditCard, Wallet, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PaymentMethod } from '@/types/order.type'

interface PaymentMethodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentMethod: PaymentMethod
  onSelectMethod: (method: PaymentMethod) => void
}

export default function PaymentMethodModal({
  open,
  onOpenChange,
  currentMethod,
  onSelectMethod
}: PaymentMethodModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Chọn phương thức thanh toán</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Khách hàng thanh toán như thế nào?</p>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <button
            className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-all ${
              currentMethod === 'CASH_ON_DELIVERY'
                ? 'border-green-500 bg-green-50 shadow-md'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50/30'
            }`}
            onClick={() => {
              onSelectMethod('CASH_ON_DELIVERY')
              onOpenChange(false)
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-7 h-7 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-bold text-base text-gray-900">Tiền mặt</div>
                <div className="text-xs text-gray-500">Thanh toán tại quầy</div>
              </div>
            </div>
            {currentMethod === 'CASH_ON_DELIVERY' && (
              <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
            )}
          </button>

          <button
            className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-all ${
              currentMethod === 'VN_PAY'
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
            onClick={() => {
              onSelectMethod('VN_PAY')
              onOpenChange(false)
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-bold text-base text-gray-900">VNPay</div>
                <div className="text-xs text-gray-500">Quét mã QR thanh toán</div>
              </div>
            </div>
            {currentMethod === 'VN_PAY' && (
              <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

