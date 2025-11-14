import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Link2, PenSquare, ClipboardList, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@/hooks";
import { categoryBrandService } from "@/services/categoryBrand.service";
import { categoryService } from "@/services/category.service";
import { brandService } from "@/services/brand.service";
import type { Category } from "@/types/category.type";
import type { Brand } from "@/types/brand.type";

interface CategoryBrandSummary {
  category: Category;
  brands: Brand[];
}

export default function CategoryBrandAssignment() {
  // UI State
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<number>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");

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
        setSearchTerm("");
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
  const handleCategoryChange = (value: string) => {
    const id = Number(value);
    setSelectedCategoryId(id || null);
    setSelectedBrandIds(new Set());
    setSearchTerm("");
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
    setSearchTerm("");
    setIsAssignDialogOpen(true);
  };

  // Computed values
  const filteredBrands = useMemo(() => {
    return allBrands.filter((brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allBrands, searchTerm]);

  const selectedCategoryName = useMemo(() => {
    return (
      allCategories.find((c) => c.id === selectedCategoryId)?.name || ""
    );
  }, [allCategories, selectedCategoryId]);

  // Loading state
  if (isLoadingBrands || isLoadingCategories) {
    return (
      <div className="space-y-3 p-2">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Link2 className="h-6 w-6" />
            Liên kết Thương hiệu - Danh mục
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý liên kết giữa thương hiệu và danh mục sản phẩm
          </p>
        </div>
      </div>

      {/* Main Content */}
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
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="category-select">Chọn Danh mục</Label>
              <Select
                onValueChange={handleCategoryChange}
                value={selectedCategoryId ? String(selectedCategoryId) : ""}
              >
                <SelectTrigger id="category-select">
                  <SelectValue placeholder="-- Chọn một danh mục --" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên Thương hiệu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLinkedBrands && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        Đang tải...
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoadingLinkedBrands && linkedBrands.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Chưa có thương hiệu nào được liên kết
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoadingLinkedBrands &&
                    linkedBrands.map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell>{brand.id}</TableCell>
                        <TableCell className="font-medium">
                          {brand.name}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
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
              <Dialog
                open={isAssignDialogOpen}
                onOpenChange={setIsAssignDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleOpenAssignDialog}
                  >
                    <PenSquare className="mr-2 h-4 w-4" />
                    Cập nhật Thương hiệu
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Cập nhật Thương hiệu</DialogTitle>
                    <DialogDescription>
                      Chọn các thương hiệu sẽ được liên kết với danh mục:{" "}
                      <strong>{selectedCategoryName}</strong>. Bỏ chọn để hủy
                      liên kết.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Tìm thương hiệu..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-72 w-full rounded-md border">
                    <div className="p-4 space-y-2">
                      {filteredBrands.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Không tìm thấy thương hiệu
                        </p>
                      ) : (
                        filteredBrands.map((brand) => (
                          <div
                            key={brand.id}
                            className="flex items-center space-x-2 py-1"
                          >
                            <Checkbox
                              id={`brand-${brand.id}`}
                              checked={selectedBrandIds.has(brand.id)}
                              onCheckedChange={(checked) =>
                                handleBrandSelectionChange(brand.id, checked)
                              }
                            />
                            <label
                              htmlFor={`brand-${brand.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {brand.name}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Hủy</Button>
                    </DialogClose>
                    <Button
                      type="button"
                      onClick={handleAssignSubmit}
                      disabled={setBrandsMutation.isLoading}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {setBrandsMutation.isLoading
                        ? "Đang cập nhật..."
                        : `Cập nhật (${selectedBrandIds.size})`}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>

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
          {isLoadingSummary && (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Đang tải tóm tắt...</p>
            </div>
          )}
          {!isLoadingSummary && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên Danh mục</TableHead>
                  <TableHead>Các Thương hiệu đã gán</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
                {summaryData.map(({ category, brands }) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium align-top w-1/4">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      {brands.length === 0 ? (
                        <span className="text-sm text-muted-foreground">
                          Chưa có thương hiệu nào
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {brands.map((brand) => (
                            <span
                              key={brand.id}
                              className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium"
                            >
                              {brand.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
