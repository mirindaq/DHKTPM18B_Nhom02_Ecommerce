import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CustomerForm from "./CustomerForm" 
import type { CustomerSummary, CreateCustomerRequest, UpdateCustomerProfileRequest } from "@/types/customer.type"

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerSummary | null;
  onSubmit: (data: CreateCustomerRequest | UpdateCustomerProfileRequest) =>Promise<void>;
  onFinished: () => void;
  isLoading: boolean;
 
}

export default function CustomerDialog({ open, onOpenChange, customer,onFinished, onSubmit, isLoading }: CustomerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[700px]  max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}</DialogTitle>
        </DialogHeader>
        <CustomerForm
          key={customer?.id || 'new-customer'} 
          customer={customer}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          onFinished={onFinished} 
          isLoading={isLoading}
            // (Thêm prop onFinished vào đây nếu cần)
        />
      </DialogContent>
    </Dialog>
  );
}