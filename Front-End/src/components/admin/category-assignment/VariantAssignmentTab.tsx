import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PenSquare, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery, useMutation } from "@/hooks";
import { variantCategoryService } from "@/services/variant-category.service";
import { categoryService } from "@/services/category.service";
import { variantService } from "@/services/variant.service";
import type { Category } from "@/types/category.type";
import type { Variant } from "@/types/variant.type";
import CategorySelector from "./CategorySelector";
import LinkedItemsTable from "./LinkedItemsTable";
import AssignDialog from "./AssignDialog";
import SummaryTable from "./SummaryTable";

interface VariantCategorySummary {
  category: Category;
  variants: Variant[];
}

export default function VariantAssignmentTab() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedVariantIds, setSelectedVariantIds] = useState<Set<number>>(
    new Set()
  );

  // Fetch all categories and variants
  const {
    data: allVariantsData,
    isLoading: isLoadingVariants,
  } = useQuery(
    () => variantService.getVariants(1, 1000, ""),
    {
      queryKey: ["all-variants-simple"],
    }
  );

  const {
    data: allCategoriesData,
    isLoading: isLoadingCategories,
  } = useQuery(
    () => categoryService.getCategories(1, 1000, ""),
    {
      queryKey: ["all-categories-simple"],
    }
  );

  const allVariants = allVariantsData?.data?.data || [];
  const allCategories = allCategoriesData?.data?.data || [];

  // Fetch variants by selected category
  const {
    data: linkedVariantsData,
    isLoading: isLoadingLinkedVariants,
    refetch: refetchLinkedVariants,
  } = useQuery(
    async () => {
      if (!selectedCategoryId) return null;
      const response = await variantCategoryService.getVariantCategoriesByCategoryId(selectedCategoryId);
      const variantIds = response.data.map(vc => vc.variantId);
      return allVariants.filter(v => variantIds.includes(v.id));
    },
    {
      queryKey: ["variants-by-category", selectedCategoryId?.toString() || ""],
      enabled: !!selectedCategoryId && allVariants.length > 0,
    }
  );

  const linkedVariants = linkedVariantsData || [];

  // Fetch summary data
  const {
    data: summaryDataArray,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useQuery(
    async () => {
      if (allCategories.length === 0) {
        return [];
      }
      const summaryPromises = allCategories.map(async (category) => {
        try {
          const res = await variantCategoryService.getVariantCategoriesByCategoryId(category.id);
          const variantIds = res.data.map(vc => vc.variantId);
          const variants = allVariants.filter(v => variantIds.includes(v.id));
          return { category, variants };
        } catch (error) {
          return { category, variants: [] };
        }
      });
      return await Promise.all(summaryPromises);
    },
    {
      queryKey: ["variant-category-summary", allCategories.length.toString(), allVariants.length.toString()],
      enabled: allCategories.length > 0 && allVariants.length > 0,
    }
  );

  const summaryData: VariantCategorySummary[] = summaryDataArray || [];

  // Mutation to assign variants to category
  const assignVariantsMutation = useMutation(
    (request: { categoryId: number; variantIds: number[] }) =>
      variantCategoryService.assignVariantsToCategory(request.categoryId, request.variantIds),
    {
      onSuccess: () => {
        toast.success("Cập nhật variant thành công");
        refetchLinkedVariants();
        refetchSummary();
        setIsAssignDialogOpen(false);
        setSelectedVariantIds(new Set());
      },
      onError: (error: any) => {
        console.error("Error assigning variants:", error);
        toast.error(
          `Cập nhật thất bại: ${
            error?.response?.data?.message || error.message || "Có lỗi xảy ra"
          }`
        );
      },
    }
  );

  // Handlers
  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedVariantIds(new Set());
  };

  const handleVariantSelectionChange = (
    variantId: number,
    checked: boolean | "indeterminate"
  ) => {
    setSelectedVariantIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(variantId);
      } else {
        newSet.delete(variantId);
      }
      return newSet;
    });
  };

  const handleAssignSubmit = () => {
    if (!selectedCategoryId) {
      toast.error("Chưa chọn danh mục.");
      return;
    }

    const variantIds = Array.from(selectedVariantIds);
    assignVariantsMutation.mutate({
      categoryId: selectedCategoryId,
      variantIds,
    });
  };

  const handleOpenAssignDialog = () => {
    const linkedIds = new Set(linkedVariants.map((variant) => variant.id));
    setSelectedVariantIds(linkedIds);
    setIsAssignDialogOpen(true);
  };

  const selectedCategoryName = useMemo(() => {
    return (
      allCategories.find((c) => c.id === selectedCategoryId)?.name || ""
    );
  }, [allCategories, selectedCategoryId]);

  if (isLoadingVariants || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenSquare className="h-5 w-5" />
            Gán Variant cho Danh mục
          </CardTitle>
          <CardDescription>
            Chọn một danh mục để xem và quản lý các variant tương ứng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategorySelector
            categories={allCategories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={handleCategoryChange}
            isLoading={isLoadingCategories}
          />
        </CardContent>
      </Card>

      {/* Linked Variants Table */}
      {selectedCategoryId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Các Variant đã liên kết ({linkedVariants.length})
            </CardTitle>
            <CardDescription>
              Danh sách các variant đã được gán cho danh mục này
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LinkedItemsTable
              items={linkedVariants}
              isLoading={isLoadingLinkedVariants}
              itemType="variant"
              showStatus={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Assign Variants Dialog */}
      {selectedCategoryId && (
        <Card>
          <CardHeader>
            <CardTitle>Cập nhật liên kết</CardTitle>
            <CardDescription>
              Thêm hoặc xóa variant khỏi danh mục đã chọn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="default"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleOpenAssignDialog}
            >
              <PenSquare className="mr-2 h-4 w-4" />
              Cập nhật Variant
            </Button>
            <AssignDialog
              open={isAssignDialogOpen}
              onOpenChange={setIsAssignDialogOpen}
              items={allVariants}
              selectedIds={selectedVariantIds}
              onSelectionChange={handleVariantSelectionChange}
              onSubmit={handleAssignSubmit}
              isLoading={assignVariantsMutation.isLoading}
              categoryName={selectedCategoryName}
              itemType="variant"
              searchPlaceholder="Tìm variant..."
            />
          </CardContent>
        </Card>
      )}

      {/* Divider */}
      <hr className="my-8 border-t border-gray-200" />

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Bảng tóm tắt: Variant theo Danh mục
          </CardTitle>
          <CardDescription>
            Tổng quan tất cả các variant đã được gán cho từng danh mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SummaryTable
            data={summaryData.map(({ category, variants }) => ({
              category,
              items: variants,
            }))}
            isLoading={isLoadingSummary}
            itemType="variant"
          />
        </CardContent>
      </Card>
    </div>
  );
}

