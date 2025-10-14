import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Tag, 
  Calendar, 
  Percent, 
  Target, 
  Star, 
  ToggleLeft, 
  ToggleRight,
  Package,
  ShoppingCart,
  Layers,
  Folder
} from "lucide-react";
import type { PromotionSummary, CreatePromotionRequest, UpdatePromotionRequest } from "@/types/promotion.type";
import { categoryService } from "@/services/category.service";
import type { Category } from "@/types/category.type";

const promotionSchema = z.object({
  name: z.string().min(1, "Tên chương trình là bắt buộc"),
  description: z.string().optional(),
  type: z.enum(["PRODUCT_VARIANT", "ORDER", "PRODUCT", "CATEGORY"]),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().min(0, "Giá trị giảm giá phải lớn hơn 0"),
  active: z.boolean(),
  priority: z.number().min(1, "Độ ưu tiên phải lớn hơn 0"),
  startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  endDate: z.string().min(1, "Ngày kết thúc là bắt buộc"),
  selectedCategoryIds: z.array(z.number()).optional(),
}).refine((data) => {
  if (data.type === "CATEGORY" && (!data.selectedCategoryIds || data.selectedCategoryIds.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Vui lòng chọn ít nhất một danh mục",
  path: ["selectedCategoryIds"],
});

type PromotionFormData = z.infer<typeof promotionSchema>;

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion?: PromotionSummary | null;
  onSubmit: (data: CreatePromotionRequest | UpdatePromotionRequest) => void;
  isLoading: boolean;
}

export default function PromotionDialog({
  open,
  onOpenChange,
  promotion,
  onSubmit,
  isLoading,
}: PromotionDialogProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "ORDER",
      discountType: "PERCENTAGE",
      discountValue: 0,
      active: true,
      priority: 1,
      startDate: "",
      endDate: "",
      selectedCategoryIds: [],
    },
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getCategories(1, 100, "");
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (promotion) {
      form.reset({
        name: promotion.name,
        description: promotion.description || "",
        type: promotion.type as "PRODUCT_VARIANT" | "ORDER" | "PRODUCT" | "CATEGORY",
        discountType: promotion.discountType as "PERCENTAGE" | "FIXED_AMOUNT",
        discountValue: promotion.discountValue,
        active: promotion.active,
        priority: promotion.priority,
        startDate: promotion.startDate.split('T')[0],
        endDate: promotion.endDate.split('T')[0],
        selectedCategoryIds: [],
      });
      setSelectedType(promotion.type);
    } else {
      form.reset({
        name: "",
        description: "",
        type: "ORDER",
        discountType: "PERCENTAGE",
        discountValue: 0,
        active: true,
        priority: 1,
        startDate: "",
        endDate: "",
        selectedCategoryIds: [],
      });
      setSelectedType("ORDER");
    }
  }, [promotion, form]);

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    form.setValue("type", value as "PRODUCT_VARIANT" | "ORDER" | "PRODUCT" | "CATEGORY");
  };

  const handleSubmit = (data: PromotionFormData) => {
    // Tạo targets array nếu cần
    const targets = data.type === "CATEGORY" && data.selectedCategoryIds && data.selectedCategoryIds.length > 0
      ? data.selectedCategoryIds.map(categoryId => ({ categoryId }))
      : undefined;

    const submitData = {
      ...data,
      targets,
    };

    // Loại bỏ selectedCategoryIds khỏi data gửi lên API
    const { selectedCategoryIds, ...apiData } = submitData;
    onSubmit(apiData);
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      ORDER: <ShoppingCart className="h-4 w-4" />,
      PRODUCT: <Package className="h-4 w-4" />,
      PRODUCT_VARIANT: <Layers className="h-4 w-4" />,
      CATEGORY: <Folder className="h-4 w-4" />,
    };
    return icons[type as keyof typeof icons] || <Target className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      ORDER: "bg-blue-100 text-blue-700 border-blue-200",
      PRODUCT: "bg-green-100 text-green-700 border-green-200",
      PRODUCT_VARIANT: "bg-purple-100 text-purple-700 border-purple-200",
      CATEGORY: "bg-orange-100 text-orange-700 border-orange-200",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold">
                {promotion ? "Chỉnh sửa chương trình khuyến mãi" : "Tạo chương trình khuyến mãi mới"}
              </h2>
              <p className="text-sm text-gray-600 font-normal">
                {promotion ? "Cập nhật thông tin chương trình khuyến mãi" : "Thiết lập chương trình khuyến mãi cho sản phẩm"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Form chính - gộp tất cả vào 1 card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                    <Tag className="h-5 w-5" />
                  </div>
                  Thông tin chương trình khuyến mãi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Thông tin cơ bản */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-blue-600" />
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Tên chương trình *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nhập tên chương trình..." 
                              {...field}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={() => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Loại khuyến mãi *
                          </FormLabel>
                          <Select onValueChange={handleTypeChange} value={selectedType}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Chọn loại khuyến mãi" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ORDER">
                                <div className="flex items-center gap-2">
                                  <ShoppingCart className="h-4 w-4" />
                                  <span>Đơn hàng</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="PRODUCT">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  <span>Sản phẩm</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="PRODUCT_VARIANT">
                                <div className="flex items-center gap-2">
                                  <Layers className="h-4 w-4" />
                                  <span>Biến thể sản phẩm</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="CATEGORY">
                                <div className="flex items-center gap-2">
                                  <Folder className="h-4 w-4" />
                                  <span>Danh mục</span>
                                </div>
                              </SelectItem>
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
                        <FormLabel>Mô tả chương trình</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Nhập mô tả chi tiết về chương trình khuyến mãi..." 
                            {...field}
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Cấu hình giảm giá */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Percent className="h-5 w-5 text-green-600" />
                    Cấu hình giảm giá
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            Loại giảm giá *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Chọn loại giảm giá" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PERCENTAGE">
                                <div className="flex items-center gap-2">
                                  <Percent className="h-4 w-4" />
                                  <span>Phần trăm (%)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="FIXED_AMOUNT">
                                <div className="flex items-center gap-2">
                                  <Tag className="h-4 w-4" />
                                  <span>Số tiền cố định (đ)</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giá trị giảm giá *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Nhập giá trị giảm giá..."
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Thời gian và cài đặt */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Thời gian & Cài đặt
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Ngày bắt đầu *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              className="h-11"
                            />
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
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Ngày kết thúc *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              className="h-11"
                            />
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
                          <FormLabel className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Độ ưu tiên *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1-10"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="h-11"
                              min="1"
                              max="10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            {field.value ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                            Trạng thái
                          </FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value.toString()}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">
                                <div className="flex items-center gap-2">
                                  <ToggleRight className="h-4 w-4 text-green-600" />
                                  <span>Hoạt động</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="false">
                                <div className="flex items-center gap-2">
                                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                                  <span>Tạm dừng</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chọn danh mục (chỉ hiện khi type = CATEGORY) */}
            {selectedType === "CATEGORY" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-1.5 bg-orange-100 rounded-md">
                      <Folder className="h-4 w-4 text-orange-600" />
                    </div>
                    Chọn danh mục áp dụng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="selectedCategoryIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          Danh mục sản phẩm *
                        </FormLabel>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categories.map((category) => {
                              const isSelected = field.value?.includes(category.id) || false;
                              return (
                                <div
                                  key={category.id}
                                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                    isSelected
                                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                                  }`}
                                  onClick={() => {
                                    const currentIds = field.value || [];
                                    const newIds = isSelected
                                      ? currentIds.filter(id => id !== category.id)
                                      : [...currentIds, category.id];
                                    field.onChange(newIds);
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded ${isSelected ? 'bg-orange-200' : 'bg-gray-100'}`}>
                                      <Folder className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium">{category.name}</span>
                                    {isSelected && (
                                      <div className="ml-auto">
                                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                          <span className="text-white text-xs">✓</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {field.value && field.value.length > 0 && (
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-sm text-orange-700">
                                <strong>Đã chọn {field.value.length} danh mục:</strong> 
                                {field.value.map(id => {
                                  const category = categories.find(c => c.id === id);
                                  return category?.name;
                                }).join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Khuyến mãi sẽ áp dụng cho tất cả sản phẩm trong các danh mục đã chọn</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Preview section */}
            {selectedType && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-1.5 bg-blue-100 rounded-md">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    Xem trước
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                    <div className={`p-2 rounded-lg border ${getTypeColor(selectedType)}`}>
                      {getTypeIcon(selectedType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getTypeColor(selectedType)}>
                          {selectedType === "ORDER" && "Đơn hàng"}
                          {selectedType === "PRODUCT" && "Sản phẩm"}
                          {selectedType === "PRODUCT_VARIANT" && "Biến thể sản phẩm"}
                          {selectedType === "CATEGORY" && "Danh mục"}
                        </Badge>
                        <Badge variant={form.watch("active") ? "default" : "secondary"}>
                          {form.watch("active") ? "Hoạt động" : "Tạm dừng"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {form.watch("name") || "Tên chương trình khuyến mãi"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {form.watch("discountType") === "PERCENTAGE" 
                          ? `Giảm ${form.watch("discountValue") || 0}%`
                          : `Giảm ${(form.watch("discountValue") || 0).toLocaleString()}đ`
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                <p>* Các trường bắt buộc</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="px-6"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      {promotion ? "Cập nhật" : "Tạo mới"}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
