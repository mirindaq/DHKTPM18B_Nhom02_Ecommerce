import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { useQuery } from "@/hooks";
import { toast } from "sonner";
import type {
  PromotionSummary,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionType,
} from "@/types/promotion.type";
import { categoryService } from "@/services/category.service";
import { brandService } from "@/services/brand.service";
import { productService } from "@/services/product.service";
import type { Category } from "@/types/category.type";
import type { Brand } from "@/types/brand.type";
import type { Product, ProductVariantDescription } from "@/types/product.type";
import CategorySearchModal from "./CategorySearchModal";
import BrandSearchModal from "./BrandSearchModal";
import ProductSearchModal from "./ProductSearchModal";
import VariantSearchModal from "./VariantSearchModal";
import SelectedItemsDisplay from "./SelectedItemsDisplay";

interface PromotionFormData {
  name: string;
  promotionType: PromotionType;
  discount: number;
  description: string;
  active: boolean;
  priority: number;
  startDate: string;
  endDate: string;
  selectedCategoryIds: number[];
  selectedBrandIds: number[];
  selectedProductIds: number[];
  selectedVariantIds: number[];
}

const getInitialFormData = (promotion: PromotionSummary | null): PromotionFormData => {
  if (promotion) {
    const categoryIds: number[] = [];
    const brandIds: number[] = [];
    const productIds: number[] = [];
    const variantIds: number[] = [];

    if (promotion.promotionTargets && promotion.promotionTargets.length > 0) {
      promotion.promotionTargets.forEach((target) => {
        if (target.categoryId) {
          categoryIds.push(target.categoryId);
        }
        if (target.brandId) {
          brandIds.push(target.brandId);
        }
        if (target.productId) {
          productIds.push(target.productId);
        }
        if (target.productVariantId) {
          variantIds.push(target.productVariantId);
        }
      });
    }

    return {
      name: promotion.name,
      promotionType: promotion.promotionType,
      discount: promotion.discount,
      description: promotion.description || "",
      active: promotion.active,
      priority: promotion.priority,
      startDate: promotion.startDate.split("T")[0],
      endDate: promotion.endDate.split("T")[0],
      selectedCategoryIds: categoryIds,
      selectedBrandIds: brandIds,
      selectedProductIds: productIds,
      selectedVariantIds: variantIds,
    };
  }

  return {
    name: "",
    promotionType: "ALL",
    discount: 0,
    description: "",
    active: true,
    priority: 5,
    startDate: "",
    endDate: "",
    selectedCategoryIds: [],
    selectedBrandIds: [],
    selectedProductIds: [],
    selectedVariantIds: [],
  };
};

interface PromotionFormProps {
  promotion?: PromotionSummary | null;
  onSubmit: (data: CreatePromotionRequest | UpdatePromotionRequest) => void;
  isLoading: boolean;
}

export default function PromotionForm({
  promotion,
  onSubmit,
  isLoading,
}: PromotionFormProps) {
  const [formData, setFormData] = useState<PromotionFormData>(() => getInitialFormData(promotion || null));
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<ProductVariantDescription[]>([]);

  // Update form data when promotion changes
  useEffect(() => {
    const initialData = getInitialFormData(promotion || null);
    setFormData(initialData);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedProducts([]);
    setSelectedVariants([]);
  }, [promotion]);

  const { data: categoriesData } = useQuery(
    () => categoryService.getCategories(1, 100, ""),
    {
      queryKey: ["categories-for-promotion", formData.selectedCategoryIds.join(",")],
      enabled: formData.promotionType === "CATEGORY" && formData.selectedCategoryIds.length > 0,
    }
  );

  const { data: brandsData } = useQuery(
    () => brandService.getBrands(1, 100, ""),
    {
      queryKey: ["brands-for-promotion", formData.selectedBrandIds.join(",")],
      enabled: formData.promotionType === "BRAND" && formData.selectedBrandIds.length > 0,
    }
  );

  const { data: productsData } = useQuery(
    () => productService.getProducts(1, 100, {}),
    {
      queryKey: ["products-for-promotion", formData.selectedProductIds.join(",")],
      enabled: (formData.promotionType === "PRODUCT" || formData.promotionType === "PRODUCT_VARIANT") && formData.selectedProductIds.length > 0,
    }
  );

  const { data: variantsData } = useQuery(
    async () => {
      const allVariants: ProductVariantDescription[] = [];
      for (const productId of formData.selectedProductIds) {
        try {
          const response = await productService.getSkusForPromotion(productId);
          allVariants.push(...(response.data || []));
        } catch (error) {
          console.error(`Error loading variants for product ${productId}:`, error);
        }
      }
      return { data: allVariants };
    },
    {
      queryKey: ["variants-for-promotion", formData.selectedProductIds.join(",")],
      enabled: formData.promotionType === "PRODUCT_VARIANT" && formData.selectedProductIds.length > 0,
    }
  );

  useEffect(() => {
    if (formData.promotionType === "CATEGORY" && categoriesData?.data?.data) {
      const categories = categoriesData.data.data;
      setSelectedCategories(categories.filter((c) => formData.selectedCategoryIds.includes(c.id)));
    } else if (formData.promotionType === "CATEGORY" && formData.selectedCategoryIds.length === 0) {
      setSelectedCategories([]);
    }
  }, [categoriesData, formData.selectedCategoryIds, formData.promotionType]);

  useEffect(() => {
    if (formData.promotionType === "BRAND" && brandsData?.data?.data) {
      const brands = brandsData.data.data;
      setSelectedBrands(brands.filter((b) => formData.selectedBrandIds.includes(b.id)));
    } else if (formData.promotionType === "BRAND" && formData.selectedBrandIds.length === 0) {
      setSelectedBrands([]);
    }
  }, [brandsData, formData.selectedBrandIds, formData.promotionType]);

  useEffect(() => {
    if ((formData.promotionType === "PRODUCT" || formData.promotionType === "PRODUCT_VARIANT") && productsData?.data?.data) {
      const products = productsData.data.data;
      setSelectedProducts(products.filter((p) => formData.selectedProductIds.includes(p.id)));
    } else if ((formData.promotionType === "PRODUCT" || formData.promotionType === "PRODUCT_VARIANT") && formData.selectedProductIds.length === 0) {
      setSelectedProducts([]);
    }
  }, [productsData, formData.selectedProductIds, formData.promotionType]);

  useEffect(() => {
    if (formData.promotionType === "PRODUCT_VARIANT") {
      if (variantsData?.data) {
        const allVariants = variantsData.data;
        if (formData.selectedVariantIds.length > 0) {
          // Filter và set các variants đã chọn
          const filtered = allVariants.filter((v) => formData.selectedVariantIds.includes(v.id));
          setSelectedVariants(filtered);
        } else {
          setSelectedVariants([]);
        }
      } else {
        // Nếu variantsData chưa load xong, chỉ clear nếu không có selectedVariantIds
        if (formData.selectedVariantIds.length === 0 || formData.selectedProductIds.length === 0) {
          setSelectedVariants([]);
        }
        // Nếu có selectedVariantIds nhưng variantsData chưa load, giữ nguyên (không clear)
      }
    } else {
      setSelectedVariants([]);
    }
  }, [variantsData, formData.selectedVariantIds, formData.selectedProductIds, formData.promotionType]);

  const handleValueChange = (field: keyof PromotionFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (value: string) => {
    const type = value as PromotionType;
    handleValueChange("promotionType", type);
    // Clear selections when type changes
    handleValueChange("selectedCategoryIds", []);
    handleValueChange("selectedBrandIds", []);
    handleValueChange("selectedProductIds", []);
    handleValueChange("selectedVariantIds", []);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedProducts([]);
    setSelectedVariants([]);
  };

  const handleCategorySelect = (category: Category) => {
    const currentIds = formData.selectedCategoryIds || [];
    if (currentIds.includes(category.id)) {
      handleValueChange("selectedCategoryIds", currentIds.filter((id) => id !== category.id));
      setSelectedCategories(selectedCategories.filter((c) => c.id !== category.id));
    } else {
      handleValueChange("selectedCategoryIds", [...currentIds, category.id]);
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleBrandSelect = (brand: Brand) => {
    const currentIds = formData.selectedBrandIds || [];
    if (currentIds.includes(brand.id)) {
      handleValueChange("selectedBrandIds", currentIds.filter((id) => id !== brand.id));
      setSelectedBrands(selectedBrands.filter((b) => b.id !== brand.id));
    } else {
      handleValueChange("selectedBrandIds", [...currentIds, brand.id]);
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleProductSelect = (product: Product) => {
    const currentIds = formData.selectedProductIds || [];
    if (currentIds.includes(product.id)) {
      handleValueChange("selectedProductIds", currentIds.filter((id) => id !== product.id));
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
      if (formData.promotionType === "PRODUCT_VARIANT") {
        const productVariants = product.variants.map((v) => v.id);
        handleValueChange(
          "selectedVariantIds",
          formData.selectedVariantIds.filter((vid) => !productVariants.includes(vid))
        );
      }
    } else {
      handleValueChange("selectedProductIds", [...currentIds, product.id]);
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleVariantSelect = (variant: ProductVariantDescription) => {
    const currentIds = formData.selectedVariantIds || [];
    if (currentIds.includes(variant.id)) {
      handleValueChange("selectedVariantIds", currentIds.filter((id) => id !== variant.id));
      setSelectedVariants(selectedVariants.filter((v) => v.id !== variant.id));
    } else {
      handleValueChange("selectedVariantIds", [...currentIds, variant.id]);
      setSelectedVariants([...selectedVariants, variant]);
    }
  };

  const handleRemoveCategory = (id: number) => {
    handleValueChange("selectedCategoryIds", formData.selectedCategoryIds.filter((i) => i !== id));
    setSelectedCategories(selectedCategories.filter((c) => c.id !== id));
  };

  const handleRemoveBrand = (id: number) => {
    handleValueChange("selectedBrandIds", formData.selectedBrandIds.filter((i) => i !== id));
    setSelectedBrands(selectedBrands.filter((b) => b.id !== id));
  };

  const handleRemoveProduct = (id: number) => {
    handleValueChange("selectedProductIds", formData.selectedProductIds.filter((i) => i !== id));
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
    if (formData.promotionType === "PRODUCT_VARIANT") {
      const product = selectedProducts.find((p) => p.id === id);
      if (product) {
        const productVariantIds = product.variants.map((v) => v.id);
        handleValueChange(
          "selectedVariantIds",
          formData.selectedVariantIds.filter((vid) => !productVariantIds.includes(vid))
        );
      }
    }
  };

  const handleRemoveVariant = (id: number) => {
    handleValueChange("selectedVariantIds", formData.selectedVariantIds.filter((i) => i !== id));
    setSelectedVariants(selectedVariants.filter((v) => v.id !== id));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Tên chương trình là bắt buộc");
      return false;
    }

    if (formData.discount <= 0 || formData.discount > 100) {
      toast.error("Giảm giá phải lớn hơn 0 và nhỏ hơn hoặc bằng 100");
      return false;
    }

    if (formData.priority < 1 || formData.priority > 10) {
      toast.error("Độ ưu tiên phải từ 1-10");
      return false;
    }

    if (!formData.startDate) {
      toast.error("Ngày bắt đầu là bắt buộc");
      return false;
    }

    if (!formData.endDate) {
      toast.error("Ngày kết thúc là bắt buộc");
      return false;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return false;
    }

    if (formData.promotionType !== "ALL") {
      if (formData.promotionType === "CATEGORY" && formData.selectedCategoryIds.length === 0) {
        toast.error("Vui lòng chọn ít nhất một danh mục");
        return false;
      }
      if (formData.promotionType === "BRAND" && formData.selectedBrandIds.length === 0) {
        toast.error("Vui lòng chọn ít nhất một thương hiệu");
        return false;
      }
      if (formData.promotionType === "PRODUCT" && formData.selectedProductIds.length === 0) {
        toast.error("Vui lòng chọn ít nhất một sản phẩm");
        return false;
      }
      if (formData.promotionType === "PRODUCT_VARIANT" && formData.selectedVariantIds.length === 0) {
        toast.error("Vui lòng chọn ít nhất một biến thể sản phẩm");
        return false;
      }
    }

    return true;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const promotionTargets = [];

    if (formData.promotionType === "CATEGORY" && formData.selectedCategoryIds.length > 0) {
      promotionTargets.push(
        ...formData.selectedCategoryIds.map((categoryId) => ({ categoryId }))
      );
    } else if (formData.promotionType === "BRAND" && formData.selectedBrandIds.length > 0) {
      promotionTargets.push(
        ...formData.selectedBrandIds.map((brandId) => ({ brandId }))
      );
    } else if (formData.promotionType === "PRODUCT" && formData.selectedProductIds.length > 0) {
      promotionTargets.push(
        ...formData.selectedProductIds.map((productId) => ({ productId }))
      );
    } else if (formData.promotionType === "PRODUCT_VARIANT" && formData.selectedVariantIds.length > 0) {
      promotionTargets.push(
        ...formData.selectedVariantIds.map((productVariantId) => ({
          productVariantId,
        }))
      );
    }

    const submitData: CreatePromotionRequest | UpdatePromotionRequest = {
      name: formData.name,
      promotionType: formData.promotionType,
      discount: formData.discount,
      description: formData.description,
      active: formData.active,
      priority: formData.priority,
      startDate: formData.startDate,
      endDate: formData.endDate,
      promotionTargets: promotionTargets.length > 0 ? promotionTargets : undefined,
    };

    onSubmit(submitData);
  };

  const handleReset = () => {
    const initialData = getInitialFormData(null);
    setFormData(initialData);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedProducts([]);
    setSelectedVariants([]);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      <div className="space-y-4 bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            1
          </span>
          Thông tin chương trình khuyến mãi
        </h3>
        <div className="space-y-6 pl-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>
                Tên chương trình <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Nhập tên..."
                value={formData.name}
                onChange={(e) => handleValueChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>
                Loại khuyến mãi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.promotionType}
                onValueChange={handleTypeChange}
                key={promotion?.id || "new"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả sản phẩm</SelectItem>
                  <SelectItem value="CATEGORY">Danh mục</SelectItem>
                  <SelectItem value="BRAND">Thương hiệu</SelectItem>
                  <SelectItem value="PRODUCT">Sản phẩm</SelectItem>
                  <SelectItem value="PRODUCT_VARIANT">Biến thể sản phẩm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Mô tả</Label>
            <Textarea
              placeholder="Nhập mô tả..."
              value={formData.description}
              onChange={(e) => handleValueChange("description", e.target.value)}
              className="min-h-[80px] resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Giảm giá và thời gian */}
      <div className="space-y-4 bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            2
          </span>
          Cấu hình giảm giá & thời gian
        </h3>
        <div className="space-y-6 pl-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label>
                Giảm giá (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.discount || ""}
                onChange={(e) => handleValueChange("discount", Number(e.target.value) || 0)}
                step="0.01"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-1">
              <Label>
                Ngày bắt đầu <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleValueChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>
                Ngày kết thúc <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleValueChange("endDate", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>
                Độ ưu tiên <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="1"
                value={formData.priority || ""}
                onChange={(e) => handleValueChange("priority", Number(e.target.value) || 1)}
                min="1"
                max="10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>
                Trạng thái <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.active.toString()}
                onValueChange={(value) => handleValueChange("active", value === "true")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Tạm dừng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Chọn đối tượng khuyến mãi */}
      {formData.promotionType !== "ALL" && (
        <div className="space-y-4 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </span>
            Chọn đối tượng khuyến mãi
          </h3>
          <div className="pl-10 space-y-6">
            {/* Chọn danh mục */}
            {formData.promotionType === "CATEGORY" && (
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="h-10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm danh mục
                </Button>
                <SelectedItemsDisplay
                  items={selectedCategories.map((c) => ({
                    id: c.id,
                    name: c.name,
                    image: c.image,
                  }))}
                  onRemove={handleRemoveCategory}
                  itemType="category"
                  emptyMessage="Chưa có danh mục nào được chọn"
                />
              </div>
            )}

            {/* Chọn thương hiệu */}
            {formData.promotionType === "BRAND" && (
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBrandModalOpen(true)}
                  className="h-10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm thương hiệu
                </Button>
                <SelectedItemsDisplay
                  items={selectedBrands.map((b) => ({
                    id: b.id,
                    name: b.name,
                    image: b.image,
                  }))}
                  onRemove={handleRemoveBrand}
                  itemType="brand"
                  emptyMessage="Chưa có thương hiệu nào được chọn"
                />
              </div>
            )}

            {/* Chọn sản phẩm */}
            {formData.promotionType === "PRODUCT" && (
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProductModalOpen(true)}
                  className="h-10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm sản phẩm
                </Button>
                <SelectedItemsDisplay
                  items={selectedProducts.map((p) => ({
                    id: p.id,
                    name: p.name,
                    thumbnail: p.thumbnail,
                  }))}
                  onRemove={handleRemoveProduct}
                  itemType="product"
                  emptyMessage="Chưa có sản phẩm nào được chọn"
                />
              </div>
            )}

            {/* Chọn biến thể sản phẩm */}
            {formData.promotionType === "PRODUCT_VARIANT" && (
              <>
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsProductModalOpen(true)}
                    className="h-10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sản phẩm
                  </Button>
                  <SelectedItemsDisplay
                    items={selectedProducts.map((p) => ({
                      id: p.id,
                      name: p.name,
                      thumbnail: p.thumbnail,
                    }))}
                    onRemove={handleRemoveProduct}
                    itemType="product"
                    emptyMessage="Chưa có sản phẩm nào được chọn"
                  />
                </div>

                {formData.selectedProductIds.length > 0 && (
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsVariantModalOpen(true)}
                      className="h-10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm biến thể
                    </Button>
                    <SelectedItemsDisplay
                      items={selectedVariants.map((v) => ({
                        id: v.id,
                        name: v.name,
                        sku: v.sku,
                      }))}
                      onRemove={handleRemoveVariant}
                      itemType="variant"
                      emptyMessage="Chưa có biến thể nào được chọn"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 bg-white rounded-lg border p-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isLoading}
          className="h-11 px-6"
        >
          Xóa
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 h-11 px-8"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xử lý...
            </div>
          ) : promotion ? (
            "Cập nhật"
          ) : (
            "Tạo mới"
          )}
        </Button>
      </div>

      <CategorySearchModal
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        selectedIds={formData.selectedCategoryIds}
        onSelectCategory={handleCategorySelect}
      />

      <BrandSearchModal
        open={isBrandModalOpen}
        onOpenChange={setIsBrandModalOpen}
        selectedIds={formData.selectedBrandIds}
        onSelectBrand={handleBrandSelect}
      />

      <ProductSearchModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        selectedIds={formData.selectedProductIds}
        onSelectProduct={handleProductSelect}
      />

      <VariantSearchModal
        open={isVariantModalOpen}
        onOpenChange={setIsVariantModalOpen}
        selectedProductIds={formData.selectedProductIds}
        selectedVariantIds={formData.selectedVariantIds}
        onSelectVariant={handleVariantSelect}
      />
    </form>
  );
}
