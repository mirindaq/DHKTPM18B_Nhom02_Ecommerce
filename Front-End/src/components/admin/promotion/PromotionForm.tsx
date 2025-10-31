import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Loader2,
} from "lucide-react";
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

const promotionSchema = z.object({
  name: z.string().min(1, "Tên chương trình là bắt buộc"),
  promotionType: z.enum(["ALL", "CATEGORY", "BRAND", "PRODUCT", "PRODUCT_VARIANT"]),
  discount: z.number().min(0.01, "Giảm giá phải lớn hơn 0"),
  description: z.string().optional(),
  active: z.boolean(),
  priority: z.number().min(1, "Độ ưu tiên phải từ 1-10").max(10, "Độ ưu tiên phải từ 1-10"),
  startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  endDate: z.string().min(1, "Ngày kết thúc là bắt buộc"),
  selectedCategoryIds: z.array(z.number()).optional(),
  selectedBrandIds: z.array(z.number()).optional(),
  selectedProductIds: z.array(z.number()).optional(),
  selectedVariantIds: z.array(z.number()).optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"],
});

type PromotionFormData = z.infer<typeof promotionSchema>;

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
  const [selectedType, setSelectedType] = useState<PromotionType>("ALL");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariantDescription[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const variantSearchRef = useRef<HTMLInputElement>(null);
  const [variantSearchValue, setVariantSearchValue] = useState("");

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
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
    },
  });

  // Load categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getCategories(1, 100, "");
        setCategories(response.data?.data || []);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  // Load brands when component mounts
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const response = await brandService.getBrands(1, 100, "");
        setBrands(response.data?.data || []);
      } catch (error) {
        console.error("Error loading brands:", error);
      }
    };
    loadBrands();
  }, []);

  // Load products when type is PRODUCT or PRODUCT_VARIANT
  useEffect(() => {
    if (selectedType === "PRODUCT" || selectedType === "PRODUCT_VARIANT") {
      const loadProducts = async () => {
        try {
          const response = await productService.getProducts(1, 100, "");
          setProducts(response?.data.data || []);
        } catch (error) {
          console.error("Error loading products:", error);
        }
      };
      loadProducts();
    }
  }, [selectedType]);

  // Load product variants when a product is selected
  useEffect(() => {
    if (selectedType === "PRODUCT_VARIANT" && selectedProductIds.length > 0) {
      const loadVariantsForSelectedProducts = async () => {
        setLoadingVariants(true);
        try {
          const allVariants: ProductVariantDescription[] = [];
          // Load SKUs for each selected product
          for (const productId of selectedProductIds) {
            try {
              const response = await productService.getSkusForPromotion(productId);
              allVariants.push(...(response.data || []));
            } catch (error) {
              console.error(`Error loading variants for product ${productId}:`, error);
            }
          }
          setProductVariants(allVariants);
        } catch (error) {
          console.error("Error loading variants:", error);
        } finally {
          setLoadingVariants(false);
        }
      };
      loadVariantsForSelectedProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, selectedProductIds.length, selectedProductIds.join(",")]);

  // Set form data when editing
  useEffect(() => {
    if (promotion) {
      form.reset({
        name: promotion.name,
        promotionType: promotion.promotionType,
        discount: promotion.discount,
        description: promotion.description || "",
        active: promotion.active,
        priority: promotion.priority,
        startDate: promotion.startDate.split("T")[0],
        endDate: promotion.endDate.split("T")[0],
        selectedCategoryIds: [],
        selectedBrandIds: [],
        selectedProductIds: [],
        selectedVariantIds: [],
      });
      setSelectedType(promotion.promotionType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promotion?.id]);

  const handleTypeChange = (value: string) => {
    const type = value as PromotionType;
    setSelectedType(type);
    form.setValue("promotionType", type);
    // Reset target selections when type changes
    form.setValue("selectedCategoryIds", []);
    form.setValue("selectedBrandIds", []);
    form.setValue("selectedProductIds", []);
    form.setValue("selectedVariantIds", []);
  };

  const handleFormSubmit = (data: PromotionFormData) => {
    const promotionTargets = [];

    if (data.promotionType === "CATEGORY" && data.selectedCategoryIds?.length) {
      promotionTargets.push(
        ...data.selectedCategoryIds.map((categoryId) => ({ categoryId }))
      );
    } else if (data.promotionType === "BRAND" && data.selectedBrandIds?.length) {
      promotionTargets.push(
        ...data.selectedBrandIds.map((brandId) => ({ brandId }))
      );
    } else if (data.promotionType === "PRODUCT" && data.selectedProductIds?.length) {
      promotionTargets.push(
        ...data.selectedProductIds.map((productId) => ({ productId }))
      );
    } else if (data.promotionType === "PRODUCT_VARIANT" && data.selectedVariantIds?.length) {
      promotionTargets.push(
        ...data.selectedVariantIds.map((productVariantId) => ({ productVariantId }))
      );
    }

    const submitData: CreatePromotionRequest | UpdatePromotionRequest = {
      name: data.name,
      promotionType: data.promotionType,
      discount: data.discount,
      description: data.description,
      active: data.active,
      priority: data.priority,
      startDate: data.startDate,
      endDate: data.endDate,
      promotionTargets: promotionTargets.length > 0 ? promotionTargets : undefined,
    };

    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Thông tin cơ bản */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin chương trình</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên chương trình *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="promotionType"
                render={() => (
                  <FormItem>
                    <FormLabel>Loại khuyến mãi *</FormLabel>
                    <Select onValueChange={handleTypeChange} value={selectedType}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALL">Tất cả sản phẩm</SelectItem>
                        <SelectItem value="CATEGORY">Danh mục</SelectItem>
                        <SelectItem value="BRAND">Thương hiệu</SelectItem>
                        <SelectItem value="PRODUCT">Sản phẩm</SelectItem>
                        <SelectItem value="PRODUCT_VARIANT">Biến thể sản phẩm</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập mô tả..." {...field} className="min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Giảm giá và thời gian */}
        <Card>
          <CardHeader>
            <CardTitle>Cấu hình giảm giá & thời gian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giảm giá (%) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        step="0.01"
                        min="0"
                        max="100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày kết thúc *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Độ ưu tiên *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        min="1"
                        max="10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Hoạt động</SelectItem>
                        <SelectItem value="false">Tạm dừng</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chọn danh mục */}
        {selectedType === "CATEGORY" && (
          <Card>
            <CardHeader>
              <CardTitle>Chọn danh mục</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="selectedCategoryIds"
                render={({ field }) => (
                  <FormItem>
                    <div className="border rounded-lg p-4">
                      <div className="space-y-2">
                        {categories.map((category) => {
                          const isSelected = field.value?.includes(category.id) || false;
                          return (
                            <label key={category.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  const newIds = isSelected
                                    ? field.value?.filter((id) => id !== category.id) || []
                                    : [...(field.value || []), category.id];
                                  field.onChange(newIds);
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{category.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    {field.value && field.value.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">Đã chọn {field.value.length} danh mục</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Chọn thương hiệu */}
        {selectedType === "BRAND" && (
          <Card>
            <CardHeader>
              <CardTitle>Chọn thương hiệu</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="selectedBrandIds"
                render={({ field }) => (
                  <FormItem>
                    <div className="border rounded-lg p-4">
                      <div className="space-y-2">
                        {brands.map((brand) => {
                          const isSelected = field.value?.includes(brand.id) || false;
                          return (
                            <label key={brand.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  const newIds = isSelected
                                    ? field.value?.filter((id) => id !== brand.id) || []
                                    : [...(field.value || []), brand.id];
                                  field.onChange(newIds);
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{brand.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    {field.value && field.value.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">Đã chọn {field.value.length} thương hiệu</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Chọn sản phẩm */}
        {selectedType === "PRODUCT" && (
          <Card>
            <CardHeader>
              <CardTitle>Chọn sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="selectedProductIds"
                render={({ field }) => (
                  <FormItem>
                    <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        {products.map((product) => {
                          const isSelected = field.value?.includes(product.id) || false;
                          return (
                            <label key={product.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  const newIds = isSelected
                                    ? field.value?.filter((id) => id !== product.id) || []
                                    : [...(field.value || []), product.id];
                                  field.onChange(newIds);
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{product.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    {field.value && field.value.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">Đã chọn {field.value.length} sản phẩm</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Chọn sản phẩm và biến thể */}
        {selectedType === "PRODUCT_VARIANT" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Chọn sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {products.map((product) => {
                      const isSelected = selectedProductIds.includes(product.id);
                      return (
                        <label key={product.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const newIds = isSelected
                                ? selectedProductIds.filter((id) => id !== product.id)
                                : [...selectedProductIds, product.id];
                              setSelectedProductIds(newIds);
                              form.setValue("selectedVariantIds", []);
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{product.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                {selectedProductIds.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">Đã chọn {selectedProductIds.length} sản phẩm</p>
                )}
              </CardContent>
            </Card>

            {selectedProductIds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Chọn biến thể</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingVariants ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Đang tải...</span>
                    </div>
                  ) : productVariants.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Không có biến thể nào</p>
                  ) : (
                    <>
                      <div className="mb-4">
                        <Input
                          ref={variantSearchRef}
                          placeholder="Tìm kiếm biến thể (tên, SKU)..."
                          value={variantSearchValue}
                          onChange={(e) => setVariantSearchValue(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="selectedVariantIds"
                        render={({ field }) => {
                          const filteredVariants = productVariants.filter((variant) =>
                            variant.name.toLowerCase().includes(variantSearchValue.toLowerCase()) ||
                            variant.sku.toLowerCase().includes(variantSearchValue.toLowerCase())
                          );

                          return (
                            <FormItem>
                              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                                <div className="space-y-2">
                                  {filteredVariants.length > 0 ? (
                                    filteredVariants.map((variant) => {
                                      const isSelected = field.value?.includes(variant.id) || false;
                                      return (
                                        <label key={variant.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {
                                              const newIds = isSelected
                                                ? field.value?.filter((id) => id !== variant.id) || []
                                                : [...(field.value || []), variant.id];
                                              field.onChange(newIds);
                                            }}
                                            className="w-4 h-4"
                                          />
                                          <span className="text-sm">{variant.name} (SKU: {variant.sku})</span>
                                        </label>
                                      );
                                    })
                                  ) : (
                                    <p className="text-gray-500 text-sm text-center py-4">Không tìm thấy biến thể</p>
                                  )}
                                </div>
                              </div>
                              {field.value && field.value.length > 0 && (
                                <p className="text-sm text-gray-600 mt-2">Đã chọn {field.value.length} biến thể</p>
                              )}
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Xóa
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </div>
            ) : (
              promotion ? "Cập nhật" : "Tạo mới"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
