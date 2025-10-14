import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Voucher, CreateVoucherRequest } from "@/types/voucher.type";

interface VoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher?: Voucher | null;
  onSubmit: (data: CreateVoucherRequest) => void;
  isLoading: boolean;
}

export default function VoucherDialog({
  open,
  onOpenChange,
  voucher,
  onSubmit,
  isLoading,
}: VoucherDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {voucher ? "Chỉnh sửa voucher" : "Tạo voucher mới"}
          </DialogTitle>
        </DialogHeader>
        {/* <VoucherFormPage
          voucher={voucher}
          onSubmit={onSubmit}
          isLoading={isLoading}
        /> */}
      </DialogContent>
    </Dialog>
  );
}
