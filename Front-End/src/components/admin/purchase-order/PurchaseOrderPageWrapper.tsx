import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { purchaseOrderService } from "@/services/purchase-order.service";
import { useMutation } from "@/hooks";
import { PurchaseOrderForm } from "./";
import type { CreatePurchaseOrderRequest } from "@/types/purchase-order.type";

interface PurchaseOrderPageWrapperProps {
  title: string;
  description: string;
  successMessage: string;
  errorMessage: string;
  submitButtonText: string;
}

export default function PurchaseOrderPageWrapper({
  title,
  description,
  successMessage,
  errorMessage,
  submitButtonText,
}: PurchaseOrderPageWrapperProps) {
  const navigate = useNavigate();

  const createMutation = useMutation(
    (request: CreatePurchaseOrderRequest) =>
      purchaseOrderService.createPurchaseOrder(request),
    {
      onSuccess: () => {
        toast.success(successMessage);
        navigate("/admin/purchase-orders");
      },
      onError: () => {
        toast.error(errorMessage);
      },
    }
  );

  const handleFormSubmit = (data: CreatePurchaseOrderRequest) => {
    createMutation.mutate(data);
  };

  const handleCancel = () => {
    navigate("/admin/purchase-orders");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {description}
          </p>
        </div>
      </div>

      {/* Form */}
      <PurchaseOrderForm
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
        isLoading={createMutation.isLoading}
        submitButtonText={submitButtonText}
      />
    </div>
  );
}
