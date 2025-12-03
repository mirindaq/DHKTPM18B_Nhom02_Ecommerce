import { Check, Ticket, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { VoucherAvailableResponse } from '@/types/voucher.type'

interface VoucherSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vouchers: VoucherAvailableResponse[]
  selectedVoucher: VoucherAvailableResponse | null
  bestVoucher: VoucherAvailableResponse | null
  selectedVoucherId: number | null
  subtotal: number
  formatPrice: (price: number) => string
  onSelectVoucher: (voucherId: number | null) => void
}

export default function VoucherSelectionModal({
  open,
  onOpenChange,
  vouchers,
  selectedVoucher,
  bestVoucher,
  selectedVoucherId,
  subtotal,
  formatPrice,
  onSelectVoucher
}: VoucherSelectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Chọn voucher
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[400px] overflow-y-auto py-2">
          {vouchers.map((voucher) => {
            const isSelected = selectedVoucher?.id === voucher.id
            const isBest = bestVoucher?.id === voucher.id
            let discountAmount = subtotal * (voucher.discount / 100)
            if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
              discountAmount = voucher.maxDiscountAmount
            }
            
            return (
              <button
                key={voucher.id}
                type="button"
                onClick={() => {
                  onSelectVoucher(voucher.id === bestVoucher?.id ? null : voucher.id)
                  onOpenChange(false)
                }}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{voucher.code}</span>
                      {isBest && (
                        <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                          Tốt nhất
                        </Badge>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{voucher.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Giảm {voucher.discount}%
                      {voucher.maxDiscountAmount > 0 && ` (tối đa ${formatPrice(voucher.maxDiscountAmount)})`}
                    </p>
                  </div>
                  <span className="font-bold text-green-600">-{formatPrice(discountAmount)}</span>
                </div>
              </button>
            )
          })}
          
          <Separator className="my-2" />
          
          {selectedVoucherId !== null && (
            <button
              type="button"
              onClick={() => {
                onSelectVoucher(null)
                onOpenChange(false)
              }}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                selectedVoucherId === null
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Tự động chọn voucher tốt nhất</span>
                {selectedVoucherId === null && <Check className="w-4 h-4 text-green-600" />}
              </div>
            </button>
          )}
          
          <button
            type="button"
            onClick={() => {
              onSelectVoucher(-1)
              onOpenChange(false)
            }}
            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
              selectedVoucherId === -1
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Không sử dụng voucher</span>
              {selectedVoucherId === -1 && <X className="w-4 h-4 text-red-600" />}
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

