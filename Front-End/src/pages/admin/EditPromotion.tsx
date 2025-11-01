import { useParams, useNavigate } from "react-router";
import { useMutation, useQuery } from "@/hooks";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PromotionForm from "@/components/admin/promotion/PromotionForm";
import { promotionService } from "@/services/promotion.service";
import type { PromotionResponse, UpdatePromotionRequest } from "@/types/promotion.type";
import { ADMIN_PATH } from "@/constants/path";

export default function EditPromotion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const promotionId = parseInt(id || "0", 10);

  const {
    data: promotionData,
    isLoading: isLoadingPromotion,
    error: promotionError,
  } = useQuery<PromotionResponse>(
    () => promotionService.getPromotionById(promotionId),
    {
      queryKey: ["promotion", promotionId.toString()],
    }
  );

  const updatePromotionMutation = useMutation(
    (data: UpdatePromotionRequest) =>
      promotionService.updatePromotion(promotionId, data),
    {
      onSuccess: () => {
        toast.success("Cập nhật chương trình khuyến mãi thành công");
        navigate(ADMIN_PATH.PROMOTIONS);
      },
      onError: (error: any) => {
        console.error("Error updating promotion:", error);
        toast.error(
          error?.response?.data?.message ||
            "Không thể cập nhật chương trình khuyến mãi"
        );
      },
    }
  );

  const promotion = promotionData?.data;

  if (isLoadingPromotion) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin chương trình...</p>
        </div>
      </div>
    );
  }

  if (promotionError || !promotion) {
    return (
      <div className="space-y-6 p-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(ADMIN_PATH.PROMOTIONS)}
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Lỗi
            </h1>
            <p className="text-lg text-red-600 mt-1">
              Không thể tải chương trình khuyến mãi
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(ADMIN_PATH.PROMOTIONS)}
          className="rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Chỉnh sửa chương trình khuyến mãi
          </h1>
          <p className="text-lg text-gray-600 mt-1">
            Cập nhật thông tin chương trình: <strong>{promotion.name}</strong>
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <Card>
        <CardContent className="pt-6">
          <PromotionForm
            promotion={promotion}
            onSubmit={(data) => {
              updatePromotionMutation.mutate(data as UpdatePromotionRequest);
            }}
            isLoading={updatePromotionMutation.isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
