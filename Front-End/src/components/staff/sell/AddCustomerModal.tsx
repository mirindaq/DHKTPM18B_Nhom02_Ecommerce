import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AddCustomerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerPhone: string
  customerName: string
  customerEmail: string
  isCreating: boolean
  onNameChange: (name: string) => void
  onEmailChange: (email: string) => void
  onSubmit: () => void
  onCancel: () => void
}

export default function AddCustomerModal({
  open,
  onOpenChange,
  customerPhone,
  customerName,
  customerEmail,
  isCreating,
  onNameChange,
  onEmailChange,
  onSubmit,
  onCancel
}: AddCustomerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Thêm khách hàng mới</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Không tìm thấy khách hàng với số điện thoại <strong>{customerPhone}</strong>
          </p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="newCustomerPhone" className="text-sm font-medium">
              Số điện thoại <span className="text-red-600">*</span>
            </Label>
            <Input
              id="newCustomerPhone"
              value={customerPhone}
              disabled
              className="mt-1.5 bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="newCustomerName" className="text-sm font-medium">
              Tên khách hàng <span className="text-red-600">*</span>
            </Label>
            <Input
              id="newCustomerName"
              placeholder="Nhập tên đầy đủ"
              value={customerName}
              onChange={(e) => onNameChange(e.target.value)}
              className="mt-1.5"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="newCustomerEmail" className="text-sm font-medium">
              Email (không bắt buộc)
            </Label>
            <Input
              id="newCustomerEmail"
              type="email"
              placeholder="Nhập email"
              value={customerEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              className="mt-1.5"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nếu bỏ trống, email mặc định sẽ là: {customerPhone}@customer.com
            </p>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800 text-xs">
              <strong>Lưu ý:</strong> Mật khẩu mặc định là <strong>Customer@123</strong>. 
              Khách hàng có thể đổi mật khẩu sau khi đăng nhập.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isCreating}
            >
              Hủy
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={onSubmit}
              disabled={isCreating || !customerName.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo khách hàng
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

