import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@/hooks";
import { voucherService } from "@/services/voucher.service";
import VoucherForm from "@/components/admin/vouchers/VoucherForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type {
  VoucherResponse,
  CreateVoucherRequest,
} from "@/types/voucher.type";

export default function VoucherFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [showSendNotificationDialog, setShowSendNotificationDialog] = useState(false);
  const [createdVoucherId, setCreatedVoucherId] = useState<number | null>(null);

  // Get voucher by ID if editing
  const {
    data: voucherData,
    isLoading: isLoadingVoucher,
    refetch: refetchVoucher,
  } = useQuery<VoucherResponse>(
    () => voucherService.getVoucherById(parseInt(id!)),
    {
      queryKey: ["voucher", id || ""],
      enabled: isEdit,
    }
  );

  const voucher = voucherData?.data;

  // Create voucher
  const createVoucherMutation = useMutation(
    (data: CreateVoucherRequest) => voucherService.createVoucher(data),
    {
      onSuccess: (response) => {
        toast.success("Tạo voucher thành công");
        // Show notification dialog for GROUP type
        if (response.voucherType === "GROUP") {
          setCreatedVoucherId(response.id);
          setShowSendNotificationDialog(true);
        } else {
          refetchVoucher();
        }
      },
      onError: (error) => {
        console.error("Error creating voucher:", error);
        toast.error("Không thể tạo voucher");
      },
    }
  );

  // Update voucher
  const updateVoucherMutation = useMutation(
    ({ id, data }: { id: number; data: CreateVoucherRequest }) =>
      voucherService.updateVoucher(id, data),
    {
      onSuccess: (response) => {
        toast.success("Cập nhật voucher thành công");
        // Show notification dialog for GROUP type
        if (response.voucherType === "GROUP") {
          setCreatedVoucherId(response.id);
          setShowSendNotificationDialog(true);
        } else {
          refetchVoucher();
        }
      },
      onError: (error) => {
        console.error("Error updating voucher:", error);
        toast.error("Không thể cập nhật voucher");
      },
    }
  );

  // Send notification mutation
  const sendNotificationMutation = useMutation(
    (voucherId: number) => voucherService.sendVoucherToCustomers(voucherId),
    {
      onSuccess: () => {
        toast.success("Gửi thông báo voucher thành công");
      },
      onError: (error) => {
        console.error("Error sending notification:", error);
        toast.error("Không thể gửi thông báo voucher");
      },
    }
  );

  const handleFormSubmit = (data: CreateVoucherRequest) => {
    setIsLoading(true);
    if (isEdit && voucher) {
      updateVoucherMutation.mutate({ id: voucher.id, data });
    } else {
      createVoucherMutation.mutate(data);
    }
    setIsLoading(false);
  };

  const handleSendNotification = (voucherId: number) => {
    sendNotificationMutation.mutate(voucherId);
  };

  const handleConfirmSendNotification = () => {
    if (createdVoucherId) {
      handleSendNotification(createdVoucherId);
      setShowSendNotificationDialog(false);
      setCreatedVoucherId(null);
      refetchVoucher();
    }
  };

  const handleCancelSendNotification = () => {
    setShowSendNotificationDialog(false);
    setCreatedVoucherId(null);
    refetchVoucher();
  };

  const handleBack = () => {
    navigate("/admin/vouchers");
  };

  if (isEdit && isLoadingVoucher) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isEdit ? "Chỉnh sửa voucher" : "Tạo voucher mới"}
          </h1>
          <p className="text-lg text-gray-600">
            {isEdit
              ? "Cập nhật thông tin voucher"
              : "Tạo voucher giảm giá mới cho khách hàng"
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <div >
        <VoucherForm
          voucher={voucher}
          onSubmit={handleFormSubmit}
          onSendNotification={handleSendNotification}
          isLoading={isLoading || createVoucherMutation.isLoading || updateVoucherMutation.isLoading}
        />
      </div>

      {/* Send notification dialog */}
      <AlertDialog open={showSendNotificationDialog} onOpenChange={setShowSendNotificationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gửi thông báo voucher</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có muốn gửi thông báo voucher đến khách hàng đã chọn không?
              Thông báo sẽ được gửi qua email đến tất cả khách hàng trong danh sách.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSendNotification}>
              Không gửi
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSendNotification}>
              Gửi thông báo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
