import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { FilterCriteria, CreateFilterCriteriaRequest } from "@/types/filterCriteria.type";
import FilterCriteriaForm from "./FilterCriteriaForm";

interface FilterCriteriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterCriteria?: FilterCriteria | null;
  categoryId?: number;
  onSubmit: (data: CreateFilterCriteriaRequest) => void;
  isLoading?: boolean;
}

export default function FilterCriteriaDialog({
  open,
  onOpenChange,
  filterCriteria,
  categoryId,
  onSubmit,
  isLoading,
}: FilterCriteriaDialogProps) {
  const handleSubmit = (data: CreateFilterCriteriaRequest) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Thêm tiêu chí lọc mới
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Điền thông tin tiêu chí lọc mới
          </DialogDescription>
        </DialogHeader>

        <FilterCriteriaForm
          filterCriteria={filterCriteria}
          categoryId={categoryId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

