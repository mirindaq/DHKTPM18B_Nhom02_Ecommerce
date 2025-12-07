import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  Save,
  X,
  Info,
  Package,
  Layers,
  Image as ImageIcon,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { uploadService } from "@/services/upload.service";
import { brandService } from "@/services/brand.service";
import { categoryService } from "@/services/category.service";
import { variantService } from "@/services/variant.service";
import { filterCriteriaService } from "@/services/filterCriteria.service";
import { useQuery } from "@/hooks";
import FileUpload from "@/components/ui/FileUpload";
import ImagePreviewGrid from "@/components/ui/ImagePreviewGrid";
import RichTextEditor from "@/components/ui/RichTextEditor";
import Quill from "quill";
import type { Product, CreateProductRequest } from "@/types/product.type";
import type { BrandListResponse } from "@/types/brand.type";
import type { CategoryListResponse } from "@/types/category.type";
import type { Attribute } from "@/types/attribute.type";
import type { Variant } from "@/types/variant.type";
import type { FilterCriteria } from "@/types/filterCriteria.type";

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: CreateProductRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

export default function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading,
  submitButtonText,
}: ProductFormProps) {
  const quillRef = useRef<Quill | null>(null);
  const hasLoadedProductRef = useRef(false);
  // Ref để track xem đã hoàn tất load product data (bao gồm cả variants) chưa
  // Chỉ cho phép useEffect sync variants SAU khi đã load xong để không bị reset
  const isInitialLoadCompleteRef = useRef(!product); // Nếu không có product (add mode) thì coi như đã load xong

  // --- Initial State ---
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: "",
    description: "",
    thumbnail: "",
    spu: "",
    brandId: 0,
    categoryId: 0,
    status: true,
    productImages: [],
    attributes: [],
    variants: [],
    filterValueIds: [],
  });

  // --- File States ---
  const [selectedThumbnailFile, setSelectedThumbnailFile] =
    useState<File | null>(null);
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProductImageFiles, setSelectedProductImageFiles] = useState<
    File[]
  >([]);
  const [previewProductImageUrls, setPreviewProductImageUrls] = useState<
    string[]
  >([]);
  // Track existing images (URLs from server) separately from new files
  const [existingProductImages, setExistingProductImages] = useState<string[]>(
    []
  );

  // --- Data States ---
  const [categoryAttributes, setCategoryAttributes] = useState<Attribute[]>([]);
  const [availableVariants, setAvailableVariants] = useState<Variant[]>([]);
  // Xóa useEffect gây loop, quản lý state variants trực tiếp
  const [selectedVariants, setSelectedVariants] = useState<number[]>([]);
  const [selectedVariantValues, setSelectedVariantValues] = useState<{
    [variantId: number]: number[];
  }>({});

  const [filterCriterias, setFilterCriterias] = useState<FilterCriteria[]>([]);
  const [selectedFilterValueIds, setSelectedFilterValueIds] = useState<
    number[]
  >([]);

  // State để lưu sku khi edit (vì ProductVariantRequest không có sku)
  const [variantSkus, setVariantSkus] = useState<{ [key: string]: string }>({});

  // --- Bulk Edit States ---
  const [bulkPrice, setBulkPrice] = useState<number>(0);
  const [bulkStock, setBulkStock] = useState<number>(0);

  // --- Queries ---
  const { data: brandsData, isLoading: isLoadingBrands } =
    useQuery<BrandListResponse>(() => brandService.getBrands(1, 100, ""), {
      queryKey: ["brands", "all"],
    });

  const { data: categoriesData, isLoading: isLoadingCategories } =
    useQuery<CategoryListResponse>(
      () => categoryService.getCategories(1, 100, ""),
      { queryKey: ["categories", "all"] }
    );

  const { data: variantsData, isLoading: _isLoadingVariants } = useQuery(
    () => variantService.getVariantsForCreateProduct(formData.categoryId),
    {
      queryKey: [
        "variants",
        "for-create-product",
        formData.categoryId.toString(),
      ],
      enabled: !!formData.categoryId,
    }
  );

  const { data: filterCriteriasData, isLoading: _isLoadingFilterCriterias } =
    useQuery(
      () =>
        filterCriteriaService.getFilterCriteriaByCategory(
          formData.categoryId,
          ""
        ),
      {
        queryKey: [
          "filter-criterias",
          "for-product",
          formData.categoryId.toString(),
        ],
        enabled: !!formData.categoryId,
      }
    );

  const brands = brandsData?.data?.data || [];
  const categories = categoriesData?.data?.data || [];

  // --- Effects for Data Syncing ---

  // 1. Sync Variants Data
  useEffect(() => {
    if (variantsData?.data) setAvailableVariants(variantsData.data);
  }, [variantsData]);

  // 2. Sync Filter Criteria Data
  useEffect(() => {
    setFilterCriterias(filterCriteriasData?.data || []);
  }, [filterCriteriasData]);

  // 3. Load Product Data (Edit Mode) - Chạy 1 lần duy nhất khi có product và categories
  useEffect(() => {
    // Chỉ load 1 lần duy nhất khi có product và categories đã load
    if (product && categories.length > 0 && !hasLoadedProductRef.current) {
      hasLoadedProductRef.current = true;
      // Setup Basic Info
      setFormData({
        name: product.name,
        description: product.description,
        thumbnail: product.thumbnail,
        spu: product.spu,
        brandId: product.brandId,
        categoryId: product.categoryId,
        status: product.status,
        productImages: product.productImages || [],
        attributes:
          product.attributes?.map((a) => ({
            attributeId: a.attribute.id,
            value: a.value,
          })) || [],
        variants:
          product.variants?.map((v) => ({
            price: v.price,
            stock: v.stock,
            variantValueIds: v.productVariantValues.map(
              (pvv) => pvv.variantValue.id
            ),
          })) || [],
        filterValueIds: [],
      });

      // Setup Preview Images
      setPreviewThumbnailUrl(product.thumbnail || "");
      // Track existing images (URLs from server)
      const existingImages = product.productImages || [];
      setExistingProductImages(existingImages);
      setPreviewProductImageUrls(existingImages);

      // Setup Attributes
      const selectedCategory = categories.find(
        (cat) => cat.id === product.categoryId
      );
      if (selectedCategory)
        setCategoryAttributes(selectedCategory.attributes || []);

      // Setup Filter Values
      if (product.id) {
        filterCriteriaService
          .getFilterValuesByProductId(product.id)
          .then((response) => {
            if (response.data?.length > 0) {
              const ids = response.data.map((fv) => fv.id);
              setSelectedFilterValueIds(ids);
              setFormData((prev) => ({ ...prev, filterValueIds: ids }));
            }
          });
      }

      // Setup Variants Selection State
      if (product.variants?.length > 0) {
        const allVariantIds = new Set<number>();
        const allVariantValueIds: { [variantId: number]: number[] } = {};
        const skusMap: { [key: string]: string } = {};

        product.variants.forEach((variant) => {
          variant.productVariantValues.forEach((pvv) => {
            const vId = pvv.variantValue.variantId;
            allVariantIds.add(vId);
            if (!allVariantValueIds[vId]) allVariantValueIds[vId] = [];
            if (!allVariantValueIds[vId].includes(pvv.variantValue.id)) {
              allVariantValueIds[vId].push(pvv.variantValue.id);
            }
          });

          // Lưu sku vào map
          const variantKey = variant.productVariantValues
            .map((pvv) => pvv.variantValue.id)
            .sort()
            .join(",");
          skusMap[variantKey] = variant.sku;
        });
        setSelectedVariants(Array.from(allVariantIds));
        setSelectedVariantValues(allVariantValueIds);
        setVariantSkus(skusMap);
      }

      // Setup Quill
      if (quillRef.current && product.description) {
        quillRef.current.root.innerHTML = product.description;
      }

      // Đánh dấu đã hoàn tất load product - cho phép useEffect sync variants chạy
      // Delay một chút để đảm bảo state đã được set xong
      setTimeout(() => {
        isInitialLoadCompleteRef.current = true;
      }, 100);
    }
  }, [product, categories]); // Chỉ phụ thuộc product và categories load xong

  // Reset ref khi product ID thay đổi (chuyển sang edit product khác)
  useEffect(() => {
    hasLoadedProductRef.current = false;
    isInitialLoadCompleteRef.current = !product; // Reset về false nếu có product mới
  }, [product?.id]);

  // Handler cho status change - dùng useCallback để tránh tạo function mới mỗi render
  const handleStatusChange = useCallback((checked: boolean) => {
    setFormData((prev) => ({ ...prev, status: checked }));
  }, []);

  const handleCategoryChange = (value: string) => {
    const newCategoryId = parseInt(value);
    if (newCategoryId === formData.categoryId) return;

    const selectedCategory = categories.find((cat) => cat.id === newCategoryId);
    const newAttributes = selectedCategory?.attributes || [];

    setCategoryAttributes(newAttributes);

    // Reset data related to category
    setFormData((prev) => ({
      ...prev,
      categoryId: newCategoryId,
      attributes: newAttributes.map((attr) => ({
        attributeId: attr.id,
        value: "",
      })),
      variants: [],
      filterValueIds: [],
    }));

    setSelectedVariants([]);
    setSelectedVariantValues({});
    setSelectedFilterValueIds([]);
  };

  // Helper: Generate Combinations - Memoized để tránh tính toán lại không cần thiết
  const generateCombinations = useCallback(
    (variantsArr: Variant[], selectedValues: { [key: number]: number[] }) => {
      if (variantsArr.length === 0) return [];

      // Chỉ lấy variants có value được chọn
      const activeVariants = variantsArr.filter(
        (v) => selectedValues[v.id] && selectedValues[v.id].length > 0
      );

      if (activeVariants.length === 0) return [];

      const combinations: { variantValueIds: number[]; combination: any[] }[] =
        [];

      const backtrack = (index: number, currentCombo: any[]) => {
        if (index === activeVariants.length) {
          combinations.push({
            variantValueIds: currentCombo.map((item) => item.id),
            combination: currentCombo,
          });
          return;
        }

        const variant = activeVariants[index];
        const activeValues = variant.variantValues.filter((vv) =>
          selectedValues[variant.id].includes(vv.id)
        );

        activeValues.forEach((val) => {
          backtrack(index + 1, [...currentCombo, val]);
        });
      };

      backtrack(0, []);
      return combinations;
    },
    []
  );

  // Effect để update variants khi selection thay đổi - Tránh gọi trực tiếp trong handler
  useEffect(() => {
    // Chờ cho đến khi initial load hoàn tất (edit mode) để không reset variants đã load
    if (!isInitialLoadCompleteRef.current) {
      return;
    }

    if (selectedVariants.length === 0) {
      setFormData((prev) => ({ ...prev, variants: [] }));
      return;
    }

    // Chỉ update khi có ít nhất một variant được chọn và có ít nhất một value được chọn
    const hasValues = Object.values(selectedVariantValues).some(
      (values) => values.length > 0
    );
    if (!hasValues) {
      setFormData((prev) => ({ ...prev, variants: [] }));
      return;
    }

    const relevantVariants = availableVariants.filter((v) =>
      selectedVariants.includes(v.id)
    );
    const combos = generateCombinations(
      relevantVariants,
      selectedVariantValues
    );

    setFormData((prev) => {
      // Tạo map để tìm nhanh hơn thay vì dùng find trong loop
      const existingMap = new Map<
        string,
        { price: number; stock: number; variantValueIds: number[] }
      >();
      if (prev.variants && prev.variants.length > 0) {
        prev.variants.forEach((v) => {
          const key = [...v.variantValueIds].sort().join(",");
          existingMap.set(key, v);
        });
      }

      // Giữ lại giá/stock cũ nếu combo id khớp (tránh mất dữ liệu khi click thêm option)
      const newVariants = combos.map((combo) => {
        const key = [...combo.variantValueIds].sort().join(",");
        const existing = existingMap.get(key);
        return {
          price: existing?.price || 0,
          stock: existing?.stock || 0,
          variantValueIds: combo.variantValueIds,
        };
      });
      return { ...prev, variants: newVariants };
    });
  }, [
    selectedVariants,
    selectedVariantValues,
    availableVariants,
    generateCombinations,
  ]);

  const handleVariantSelection = useCallback(
    (variantId: number, checked: boolean) => {
      if (checked) {
        setSelectedVariants((prev) => {
          if (prev.includes(variantId)) return prev;
          return [...prev, variantId];
        });
        setSelectedVariantValues((prev) => ({ ...prev, [variantId]: [] }));
      } else {
        setSelectedVariants((prev) => prev.filter((id) => id !== variantId));
        setSelectedVariantValues((prev) => {
          const newValues = { ...prev };
          delete newValues[variantId];
          return newValues;
        });
      }
    },
    []
  );

  const handleVariantValueSelection = useCallback(
    (variantId: number, variantValueId: number, checked: boolean) => {
      setSelectedVariantValues((prev) => {
        const currentValues = prev[variantId] || [];

        if (checked) {
          if (currentValues.includes(variantValueId)) return prev;
          return { ...prev, [variantId]: [...currentValues, variantValueId] };
        } else {
          return {
            ...prev,
            [variantId]: currentValues.filter((id) => id !== variantValueId),
          };
        }
      });
    },
    []
  );

  // --- Other Handlers ---
  const handleToggleFilterValue = (filterValueId: number) => {
    const newIds = selectedFilterValueIds.includes(filterValueId)
      ? selectedFilterValueIds.filter((id) => id !== filterValueId)
      : [...selectedFilterValueIds, filterValueId];

    setSelectedFilterValueIds(newIds);
    setFormData((prev) => ({ ...prev, filterValueIds: newIds }));
  };

  const handleApplyToAll = () => {
    setFormData((prev) => ({
      ...prev,
      variants:
        prev.variants?.map((variant) => ({
          ...variant,
          price: bulkPrice,
          stock: bulkStock,
        })) || [],
    }));
    toast.success("Đã áp dụng cho tất cả phân loại");
  };

  // File handlers
  const handleThumbnailFiles = (files: File[]) => {
    if (files.length > 0) {
      setSelectedThumbnailFile(files[0]);
      setPreviewThumbnailUrl(URL.createObjectURL(files[0]));
    } else {
      setSelectedThumbnailFile(null);
      setPreviewThumbnailUrl("");
    }
  };

  const handleProductImageFiles = (files: File[]) => {
    setSelectedProductImageFiles((prev) => [...prev, ...files]);
    setPreviewProductImageUrls((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalThumbnail = formData.thumbnail;
      // Start with existing images that haven't been removed
      let finalProductImages = [...existingProductImages];

      let editorHtml = "";
      if (quillRef.current) {
        editorHtml = quillRef.current.root.innerHTML || "";

        if (editorHtml && editorHtml !== "<p><br></p>") {
          const parser = new DOMParser();
          const doc = parser.parseFromString(editorHtml, "text/html");
          const imgTags = doc.querySelectorAll("img");
          for (const img of imgTags) {
            const src = img.getAttribute("src") || "";
            if (src.startsWith("data:image")) {
              // Tạo file từ base64
              const blob = await (await fetch(src)).blob();
              const file = new File([blob], `image-${Date.now()}.png`, {
                type: blob.type,
              });
              // Upload
              const uploadResponse = await uploadService.uploadImage([file]);
              if (uploadResponse.data && uploadResponse.data.length > 0) {
                const uploadedUrl = uploadResponse.data[0];
                // Replace src
                img.setAttribute("src", uploadedUrl);
              }
            }
          }
          editorHtml = doc.body.innerHTML;
        }
      }

      // Upload thumbnail (riêng biệt)
      if (selectedThumbnailFile) {
        setIsUploading(true);
        const uploadResponse = await uploadService.uploadImage([
          selectedThumbnailFile,
        ]);
        if (uploadResponse.data && uploadResponse.data.length > 0) {
          finalThumbnail = uploadResponse.data[0];
        } else {
          toast.error("Không thể upload hình ảnh thumbnail");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      // Upload product images (riêng biệt với thumbnail)
      if (selectedProductImageFiles.length > 0) {
        setIsUploading(true);
        const uploadResponse = await uploadService.uploadImage(
          selectedProductImageFiles
        );
        if (uploadResponse.data && uploadResponse.data.length > 0) {
          finalProductImages = [...finalProductImages, ...uploadResponse.data];
        } else {
          toast.error("Không thể upload hình ảnh sản phẩm");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const submitData: CreateProductRequest = {
        ...formData,
        thumbnail: finalThumbnail,
        description: editorHtml,
        productImages: finalProductImages,
        variants: formData.variants?.map((v) => {
          const { sku, ...rest } = v as any;
          return rest;
        }),
      };

      onSubmit(submitData);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra");
      setIsUploading(false);
    }
  };

  const variantsForRender = useMemo(() => {
    if (!formData.variants || formData.variants.length === 0) return [];

    const variantValueMap = new Map<number, string>();
    availableVariants.forEach((variant) => {
      variant.variantValues.forEach((vv) => {
        variantValueMap.set(vv.id, vv.value);
      });
    });

    const allSelectedValueIds = new Set<number>();
    Object.values(selectedVariantValues).forEach((ids) => {
      ids.forEach((id) => allSelectedValueIds.add(id));
    });

    return formData.variants
      .map((v, originalIndex) => ({ v, originalIndex }))
      .filter(({ v }) => {
        return v.variantValueIds.every((id) => allSelectedValueIds.has(id));
      })
      .map(({ v, originalIndex }) => {
        const names = v.variantValueIds.map(
          (id) => variantValueMap.get(id) || "?"
        );

        const variantKey = [...v.variantValueIds].sort().join(",");
        const sku = product ? variantSkus[variantKey] || "" : "";

        return { ...v, names, index: originalIndex, sku };
      });
  }, [
    formData.variants,
    availableVariants,
    product,
    variantSkus,
    selectedVariantValues,
  ]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20 relative">
      {/* Sticky Header Action Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b py-4 px-6 -mx-6 -mt-6 mb-6 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {product ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
          </h1>
          <p className="text-sm text-gray-500">
            Điền đầy đủ thông tin bên dưới
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {submitButtonText || "Lưu sản phẩm"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Content (chiếm 2 phần) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Thông tin chung */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" /> Thông tin chung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="VD: Áo thun nam Cotton..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spu">
                  Mã sản phẩm (SPU) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="spu"
                  value={formData.spu}
                  onChange={(e) =>
                    setFormData({ ...formData, spu: e.target.value })
                  }
                  placeholder="VD: SP001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Mô tả chi tiết</Label>
                <RichTextEditor
                  ref={quillRef}
                  defaultValue={formData.description}
                  className="min-h-[250px]"
                  placeholder="Mô tả chi tiết sản phẩm..."
                />
              </div>
            </CardContent>
          </Card>

          {/* 2. Hình ảnh */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" /> Thư viện ảnh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Hình ảnh chi tiết</Label>
                <FileUpload
                  onFilesSelected={handleProductImageFiles}
                  accept="image/*"
                  multiple
                  variant="product"
                />
                <ImagePreviewGrid
                  images={previewProductImageUrls}
                  onRemove={(idx) => {
                    const removedUrl = previewProductImageUrls[idx];

                    // Check if removed image is an existing one (from server) or a new file (blob URL)
                    const isExistingImage = !removedUrl.startsWith("blob:");

                    if (isExistingImage) {
                      // Remove from existing images
                      setExistingProductImages((prev) =>
                        prev.filter((url) => url !== removedUrl)
                      );
                    } else {
                      // Remove from new files - find index based on blob URLs
                      const blobUrls = previewProductImageUrls.filter((url) =>
                        url.startsWith("blob:")
                      );
                      const blobIndex = blobUrls.indexOf(removedUrl);
                      if (blobIndex !== -1) {
                        setSelectedProductImageFiles((prev) =>
                          prev.filter((_, i) => i !== blobIndex)
                        );
                      }
                    }

                    // Always remove from preview
                    setPreviewProductImageUrls((prev) =>
                      prev.filter((_, i) => i !== idx)
                    );
                  }}
                  variant="product"
                />
              </div>
            </CardContent>
          </Card>

          {/* 3. Biến thể & Giá */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-green-500" /> Phân loại hàng
              </CardTitle>
              <CardDescription>
                Quản lý các biến thể như màu sắc, kích thước...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!formData.categoryId ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">
                    Vui lòng chọn Danh mục trước để thiết lập phân loại
                  </p>
                </div>
              ) : (
                <>
                  {/* Chọn Variant Groups */}
                  <div className="space-y-4">
                    <Label>Nhóm phân loại</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableVariants.map((variant) => (
                        <div
                          key={variant.id}
                          className="border rounded-lg p-4 bg-gray-50/50"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <input
                              type="checkbox"
                              checked={selectedVariants.includes(variant.id)}
                              onChange={(e) =>
                                handleVariantSelection(
                                  variant.id,
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="font-medium">{variant.name}</span>
                          </div>
                          {selectedVariants.includes(variant.id) && (
                            <div className="ml-6 flex flex-wrap gap-2">
                              {variant.variantValues.map((val) => (
                                <label
                                  key={val.id}
                                  className={`cursor-pointer px-3 py-1 text-xs border rounded-md transition-colors ${
                                    selectedVariantValues[variant.id]?.includes(
                                      val.id
                                    )
                                      ? "bg-blue-100 text-blue-800 border-blue-200"
                                      : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={
                                      selectedVariantValues[
                                        variant.id
                                      ]?.includes(val.id) || false
                                    }
                                    onChange={(e) =>
                                      handleVariantValueSelection(
                                        variant.id,
                                        val.id,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  {val.value}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bảng Variants */}
                  {variantsForRender && variantsForRender.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-end gap-3 p-4 bg-gray-100 rounded-lg border">
                        <div className="flex-1 min-w-[120px]">
                          <Label className="text-xs mb-1 block">
                            Giá hàng loạt
                          </Label>
                          <Input
                            type="number"
                            value={bulkPrice}
                            onChange={(e) =>
                              setBulkPrice(Number(e.target.value))
                            }
                            className="h-8 bg-white"
                            placeholder="0"
                          />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                          <Label className="text-xs mb-1 block">
                            Kho hàng loạt
                          </Label>
                          <Input
                            type="number"
                            value={bulkStock}
                            onChange={(e) =>
                              setBulkStock(Number(e.target.value))
                            }
                            className="h-8 bg-white"
                            placeholder="0"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleApplyToAll}
                          size="sm"
                          variant="secondary"
                          className="h-8"
                        >
                          Áp dụng
                        </Button>
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium text-gray-700">
                                Phân loại
                              </th>
                              <th className="px-4 py-3 w-40 font-medium text-gray-700">
                                Giá bán *
                              </th>
                              <th className="px-4 py-3 w-32 font-medium text-gray-700">
                                Kho *
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {variantsForRender.map((item, i) => (
                              <tr
                                key={i}
                                className="group hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-2 text-gray-700 font-medium">
                                  {item.names.join(" / ")}
                                </td>
                                <td className="px-4 py-2">
                                  <Input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => {
                                      const newVariants = [
                                        ...(formData.variants || []),
                                      ];
                                      newVariants[item.index].price = Number(
                                        e.target.value
                                      );
                                      setFormData({
                                        ...formData,
                                        variants: newVariants,
                                      });
                                    }}
                                    className="h-8"
                                    placeholder="0"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <Input
                                    type="number"
                                    value={item.stock}
                                    onChange={(e) => {
                                      const newVariants = [
                                        ...(formData.variants || []),
                                      ];
                                      newVariants[item.index].stock = Number(
                                        e.target.value
                                      );
                                      setFormData({
                                        ...formData,
                                        variants: newVariants,
                                      });
                                    }}
                                    className="h-8"
                                    placeholder="0"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* 4. Thuộc tính (Attributes) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" /> Thuộc tính sản
                phẩm
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryAttributes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryAttributes.map((attr, i) => (
                    <div key={attr.id} className="space-y-2">
                      <Label>{attr.name}</Label>
                      <Input
                        value={formData.attributes?.[i]?.value || ""}
                        onChange={(e) => {
                          const updated = [...(formData.attributes || [])];
                          updated[i] = {
                            attributeId: attr.id,
                            value: e.target.value,
                          };
                          setFormData((prev) => ({
                            ...prev,
                            attributes: updated,
                          }));
                        }}
                        placeholder={`Nhập ${attr.name}`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Danh mục này chưa có thuộc tính đặc tả.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sidebar (chiếm 1 phần) */}
        <div className="space-y-8">
          {/* 1. Tổ chức */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tổ chức hàng hóa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <span
                    className={`text-sm font-medium ${
                      formData.status ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {formData.status ? "Đang hoạt động" : "Đã ẩn"}
                  </span>
                  <Switch
                    checked={formData.status}
                    onCheckedChange={handleStatusChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Danh mục <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoryId.toString()}
                  onValueChange={handleCategoryChange}
                  disabled={isLoadingCategories}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Thương hiệu <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.brandId.toString()}
                  onValueChange={(v) =>
                    setFormData({ ...formData, brandId: Number(v) })
                  }
                  disabled={isLoadingBrands}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 2. Ảnh đại diện */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Ảnh đại diện (Thumbnail)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFilesSelected={handleThumbnailFiles}
                accept="image/*"
                maxFiles={1}
                variant="thumbnail"
              />
              {previewThumbnailUrl && (
                <div className="mt-4 relative rounded-lg border overflow-hidden group">
                  <img
                    src={previewThumbnailUrl}
                    alt="Thumbnail"
                    className="w-full h-auto object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedThumbnailFile(null);
                      setPreviewThumbnailUrl("");
                      // Also clear formData thumbnail when removing
                      setFormData((prev) => ({ ...prev, thumbnail: "" }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Bộ lọc (Filter Criteria) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tiêu chí lọc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!formData.categoryId ? (
                <p className="text-xs text-gray-500">
                  Chọn danh mục để hiển thị bộ lọc.
                </p>
              ) : filterCriterias.length > 0 ? (
                filterCriterias.map((fc) => (
                  <div key={fc.id} className="space-y-2">
                    <Label className="text-xs uppercase text-gray-500 font-bold">
                      {fc.name}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {fc.filterValues?.map((fv) => (
                        <button
                          key={fv.id}
                          type="button"
                          onClick={() => handleToggleFilterValue(fv.id)}
                          className={`px-3 py-1 text-xs border rounded-md transition-all ${
                            selectedFilterValueIds.includes(fv.id)
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {fv.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500">
                  Không có tiêu chí lọc nào.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
