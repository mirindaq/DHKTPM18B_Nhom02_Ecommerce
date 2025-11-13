import { useNavigate } from "react-router";
import { useMutation } from "@/hooks";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PromotionForm from "@/components/admin/promotion/PromotionForm";
import { promotionService } from "@/services/promotion.service";
import type { CreatePromotionRequest } from "@/types/promotion.type";
import { ADMIN_PATH } from "@/constants/path";

export default function AddPromotion() {
  const navigate = useNavigate();

  const createPromotionMutation = useMutation(
    (data: CreatePromotionRequest) => promotionService.createPromotion(data),
    {
      onSuccess: () => {
        toast.success("Thêm chương trình khuyến mãi thành công");
        navigate(ADMIN_PATH.PROMOTIONS);
      },
      onError: (error: any) => {
        console.error("Error creating promotion:", error);
        toast.error(error?.response?.data?.message || "Không thể thêm chương trình khuyến mãi");
      },
    }
  );

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
            Thêm chương trình khuyến mãi
          </h1>
          <p className="text-lg text-gray-600 mt-1">
            Tạo một chương trình khuyến mãi mới cho cửa hàng của bạn
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <Card>
        <CardContent className="pt-6">
          <PromotionForm
            promotion={null}
            onSubmit={(data) => {
              createPromotionMutation.mutate(data as CreatePromotionRequest);
            }}
            isLoading={createPromotionMutation.isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
