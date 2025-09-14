// src/components/admin/staffs/StaffDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import StaffForm from "./StaffForm";
import type {
  Staff,
  CreateStaffRequest,
  UpdateStaffRequest,
  UserRole,
} from "@/types/staff.type";

interface StaffDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffRequest | UpdateStaffRequest) => void;
  staff: Staff | null;
  roles: UserRole[];
  isLoading?: boolean;
  isEdit?: boolean;
}

export default function StaffDialog({
  open,
  onClose,
  onSubmit,
  staff,
  roles,
  isLoading,
  isEdit = false,
}: StaffDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="min-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
          </DialogTitle>
        </DialogHeader>

        <StaffForm
          staff={staff}
          roles={roles}
          onSubmit={(data) => {
            onSubmit(data);
            // caller sẽ đóng khi mutation thành công
          }}
          onCancel={onClose}
          isLoading={!!isLoading}
          isEdit={isEdit}
        />

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
