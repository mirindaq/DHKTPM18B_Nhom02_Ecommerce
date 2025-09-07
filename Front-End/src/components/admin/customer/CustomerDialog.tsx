import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
  
  import type { CustomerSummary, CreateCustomerRequest } from "@/types/customer.type"
  import CustomerForm from "./CustomerForm"
  
  interface CustomerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customer?: CustomerSummary | null
    onSubmit: (data: CreateCustomerRequest) => void
    isLoading?: boolean
  }
  
  export default function CustomerDialog({
    open,
    onOpenChange,
    customer,
    onSubmit,
    isLoading
  }: CustomerDialogProps) {
    const handleSubmit = (data: CreateCustomerRequest) => {
      onSubmit(data)
    }
  
    const handleCancel = () => {
      onOpenChange(false)
    }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {customer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {customer ? "Cập nhật thông tin khách hàng" : "Điền thông tin khách hàng mới"}
            </DialogDescription>
          </DialogHeader>
          
          <CustomerForm
            customer={customer}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    )
  }
  