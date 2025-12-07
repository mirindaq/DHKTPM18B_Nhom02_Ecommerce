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
import { categoryBrandService } from "@/services/categoryBrand.service";
import { categoryService } from "@/services/category.service";
import { brandService } from "@/services/brand.service";
import type { Category } from "@/types/category.type";
import type { Brand } from "@/types/brand.type";
import CategorySelector from "./CategorySelector";
import LinkedItemsTable from "./LinkedItemsTable";
import AssignDialog from "./AssignDialog";
import SummaryTable from "./SummaryTable";

interface CategoryBrandSummary {
  category: Category;
  brands: Brand[];
}

export default function BrandAssignmentTab() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<number>>(
    new Set()
  );

  // Fetch all categories and brands
  const {
    data: allBrandsData,
    isLoading: isLoadingBrands,
  } = useQuery(() => brandService.getAllBrandsSimple(), {
    queryKey: ["all-brands-simple"],
  });

  const {
    data: allCategoriesData,
    isLoading: isLoadingCategories,
  } = useQuery(() => categoryService.getAllCategoriesSimple(), {
    queryKey: ["all-categories-simple"],
  });

  const allBrands = allBrandsData?.data?.data || [];
  const allCategories = allCategoriesData?.data?.data || [];

  // Fetch brands by selected category
  const {
    data: linkedBrandsData,
    isLoading: isLoadingLinkedBrands,
    refetch: refetchLinkedBrands,
  } = useQuery(
    () => categoryBrandService.getBrandsByCategoryId(selectedCategoryId!, ""),
    {
      queryKey: ["brands-by-category", selectedCategoryId?.toString() || ""],
      enabled: !!selectedCategoryId,
    }
  );

  const linkedBrands = linkedBrandsData?.data || [];

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
        const res = await categoryBrandService.getBrandsByCategoryId(
          category.id,
          ""
        );
        return { category, brands: res.data };
      });
      return await Promise.all(summaryPromises);
    },
    {
      queryKey: ["category-brand-summary", allCategories.length.toString()],
      enabled: allCategories.length > 0,
    }
  );

  const summaryData: CategoryBrandSummary[] = summaryDataArray || [];

  // Mutation to set brands for category
  const setBrandsMutation = useMutation(
    (request: { categoryId: number; brandIds: number[] }) =>
      categoryBrandService.setBrandsForCategory(request),
    {
      onSuccess: () => {
        toast.success("Cập nhật thương hiệu thành công");
        refetchLinkedBrands();
        refetchSummary();
        setIsAssignDialogOpen(false);
        setSelectedBrandIds(new Set());
      },
      onError: (error: any) => {
        console.error("Error setting brands:", error);
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
    setSelectedBrandIds(new Set());
  };

  const handleBrandSelectionChange = (
    brandId: number,
    checked: boolean | "indeterminate"
  ) => {
    setSelectedBrandIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(brandId);
      } else {
        newSet.delete(brandId);
      }
      return newSet;
    });
  };

  const handleAssignSubmit = () => {
    if (!selectedCategoryId) {
      toast.error("Chưa chọn danh mục.");
      return;
    }

    const brandIds = Array.from(selectedBrandIds);
    setBrandsMutation.mutate({
      categoryId: selectedCategoryId,
      brandIds,
    });
  };

  const handleOpenAssignDialog = () => {
    const linkedIds = new Set(linkedBrands.map((brand) => brand.id));
    setSelectedBrandIds(linkedIds);
    setIsAssignDialogOpen(true);
  };

  const selectedCategoryName = useMemo(() => {
    return (
      allCategories.find((c) => c.id === selectedCategoryId)?.name || ""
    );
  }, [allCategories, selectedCategoryId]);

  if (isLoadingBrands || isLoadingCategories) {
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
            Gán Thương hiệu cho Danh mục
          </CardTitle>
          <CardDescription>
            Chọn một danh mục để xem và quản lý các thương hiệu tương ứng
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

      {/* Linked Brands Table */}
      {selectedCategoryId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Các Thương hiệu đã liên kết ({linkedBrands.length})
            </CardTitle>
            <CardDescription>
              Danh sách các thương hiệu đã được gán cho danh mục này
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LinkedItemsTable
              items={linkedBrands}
              isLoading={isLoadingLinkedBrands}
              itemType="brand"
            />
          </CardContent>
        </Card>
      )}

      {/* Assign Brands Dialog */}
      {selectedCategoryId && (
        <Card>
          <CardHeader>
            <CardTitle>Cập nhật liên kết</CardTitle>
            <CardDescription>
              Thêm hoặc xóa thương hiệu khỏi danh mục đã chọn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="default"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleOpenAssignDialog}
            >
              <PenSquare className="mr-2 h-4 w-4" />
              Cập nhật Thương hiệu
            </Button>
            <AssignDialog
              open={isAssignDialogOpen}
              onOpenChange={setIsAssignDialogOpen}
              items={allBrands}
              selectedIds={selectedBrandIds}
              onSelectionChange={handleBrandSelectionChange}
              onSubmit={handleAssignSubmit}
              isLoading={setBrandsMutation.isLoading}
              categoryName={selectedCategoryName}
              itemType="brand"
              searchPlaceholder="Tìm thương hiệu..."
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
            Bảng tóm tắt: Thương hiệu theo Danh mục
          </CardTitle>
          <CardDescription>
            Tổng quan tất cả các thương hiệu đã được gán cho từng danh mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SummaryTable
            data={summaryData.map(({ category, brands }) => ({
              category,
              items: brands,
            }))}
            isLoading={isLoadingSummary}
            itemType="brand"
          />
        </CardContent>
      </Card>
    </div>
  );
}

