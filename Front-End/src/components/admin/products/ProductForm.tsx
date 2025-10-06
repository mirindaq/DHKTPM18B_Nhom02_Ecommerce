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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadService } from "@/services/upload.service";
import { brandService } from "@/services/brand.service";
import { categoryService } from "@/services/category.service";
import { variantService } from "@/services/variant.service";
import { useQuery } from "@/hooks";
import FileUpload from "@/components/ui/FileUpload";
import ImagePreviewGrid from "@/components/ui/ImagePreviewGrid";
import RichTextEditor from "@/components/ui/RichTextEditor";
import Quill from "quill";
import type {
  Product,
  CreateProductRequest,
  ProductAttributeRequest,
  ProductVariantRequest,
} from "@/types/product.type";
import type { BrandListResponse } from "@/types/brand.type";
import type { CategoryListResponse } from "@/types/category.type";
import type { Attribute } from "@/types/attribute.type";
import type { Variant } from "@/types/variant.type";

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
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: "",
    stock: 0,
    discount: 0,
    description: "",
    thumbnail: "",
    spu: "",
    brandId: 0,
    categoryId: 0,
    status: true,
    productImages: [],
    attributes: [],
    variants: [],
  });

  // State cho thumbnail (riêng biệt)
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // State cho product images (riêng biệt với thumbnail)
  const [selectedProductImageFiles, setSelectedProductImageFiles] = useState<File[]>([]);
  const [previewProductImageUrls, setPreviewProductImageUrls] = useState<string[]>([]);

  // State cho attributes và variants
  const [categoryAttributes, setCategoryAttributes] = useState<Attribute[]>([]);
  const [availableVariants, setAvailableVariants] = useState<Variant[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<number[]>([]);
  const [selectedVariantValues, setSelectedVariantValues] = useState<{ [variantId: number]: number[] }>({});
  const [currentCategoryId, setCurrentCategoryId] = useState<number>(0);

  // State cho bulk edit
  const [bulkPrice, setBulkPrice] = useState<number>(0);
  const [bulkStock, setBulkStock] = useState<number>(0);
  const [bulkSku, setBulkSku] = useState<string>("");

  // Load brands using useQuery
  const {
    data: brandsData,
    isLoading: isLoadingBrands
  } = useQuery<BrandListResponse>(
    () => brandService.getBrands(1, 100, ""),
    {
      queryKey: ["brands", "all"]
    }
  );

  // Load categories using useQuery
  const {
    data: categoriesData,
    isLoading: isLoadingCategories
  } = useQuery<CategoryListResponse>(
    () => categoryService.getCategories(1, 100, ""),
    {
      queryKey: ["categories", "all"]
    }
  );

  const {
    data: variantsData,
    isLoading: isLoadingVariants
  } = useQuery(
    () => variantService.getVariantsForCreateProduct(formData.categoryId),
    {
      queryKey: ["variants", "for-create-product", formData.categoryId.toString()],
      enabled: !!formData.categoryId
    }
  );

  const brands = brandsData?.data?.data || [];
  const categories = categoriesData?.data?.data || [];
  const variants = variantsData?.data || [];

  // Hàm tạo tổ hợp variant values
  const generateVariantCombinations = useCallback((variants: Variant[]) => {
    if (variants.length === 0) return [];

    const combinations: any[] = [];

    // Tạo tất cả tổ hợp có thể từ các variant values
    const generateCombinations = (index: number, currentCombination: any[]) => {
      if (index === variants.length) {
        combinations.push({
          variantValueIds: currentCombination.map(item => item.id),
          combination: currentCombination
        });
        return;
      }

      const variant = variants[index];
      variant.variantValues.forEach(variantValue => {
        generateCombinations(index + 1, [...currentCombination, variantValue]);
      });
    };

    generateCombinations(0, []);
    return combinations;
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        stock: product.stock,
        discount: product.discount,
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
            oldPrice: v.oldPrice,
            sku: v.sku,
            stock: v.stock,
            variantValueIds: v.productVariantValues.map(
              (pvv) => pvv.variantValue.id
            ),
          })) || [],
      });
      // Set thumbnail preview
      setPreviewThumbnailUrl(product.thumbnail || "");
      // Set product images preview (không bao gồm thumbnail)
      setPreviewProductImageUrls(product.productImages || []);
      // Set current category ID để tránh trigger useEffect category change
      setCurrentCategoryId(product.categoryId);
    }
  }, [product]);

  // Cập nhật nội dung editor khi product thay đổi
  useEffect(() => {
    if (quillRef.current && product?.description) {
      quillRef.current.root.innerHTML = product.description;
    }
  }, [product?.description]);

  // Load attributes khi category thay đổi
  useEffect(() => {
    if (formData.categoryId !== currentCategoryId) {
      setCurrentCategoryId(formData.categoryId);

      if (formData.categoryId && categories.length > 0) {
        const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
        if (selectedCategory) {
          setCategoryAttributes(selectedCategory.attributes || []);
          // Reset attributes trong formData
          setFormData(prev => ({
            ...prev,
            attributes: (selectedCategory.attributes || []).map(attr => ({
              attributeId: attr.id,
              value: ""
            })),
            variants: [] // Reset variants cùng lúc để tránh multiple setState calls
          }));
        }
      } else {
        setCategoryAttributes([]);
        setFormData(prev => ({
          ...prev,
          attributes: [],
          variants: [] // Reset variants cùng lúc để tránh multiple setState calls
        }));
      }

      // Reset variants khi thay đổi danh mục
      setSelectedVariants([]);
      setSelectedVariantValues({});
    }
  }, [formData.categoryId, categories, currentCategoryId]);

  // Load attributes và variants khi có product và categories đã load
  useEffect(() => {
    if (product && categories.length > 0 && formData.categoryId === product.categoryId) {
      const selectedCategory = categories.find(cat => cat.id === product.categoryId);
      if (selectedCategory) {
        setCategoryAttributes(selectedCategory.attributes || []);
      }
    }
  }, [product, categories, formData.categoryId]);

  // Load available variants
  useEffect(() => {
    if (variants.length > 0) {
      setAvailableVariants(variants);
    }
  }, [variants]);

  // Load selected variants và variant values khi có product và variants đã load
  useEffect(() => {
    if (product && variants.length > 0 && product.variants && product.variants.length > 0) {
      // Lấy tất cả variant IDs từ product variants
      const allVariantIds = new Set<number>();
      const allVariantValueIds: { [variantId: number]: number[] } = {};

      product.variants.forEach(variant => {
        variant.productVariantValues.forEach(pvv => {
          const variantValue = pvv.variantValue;
          const variantId = variantValue.variantId;
          
          allVariantIds.add(variantId);
          
          if (!allVariantValueIds[variantId]) {
            allVariantValueIds[variantId] = [];
          }
          if (!allVariantValueIds[variantId].includes(variantValue.id)) {
            allVariantValueIds[variantId].push(variantValue.id);
          }
        });
      });

      setSelectedVariants(Array.from(allVariantIds));
      setSelectedVariantValues(allVariantValueIds);
    }
  }, [product, variants]);

  // Tính toán variant combinations với useMemo - chỉ từ các variant values được chọn
  const variantCombinations = useMemo(() => {
    if (selectedVariants.length > 0 && availableVariants.length > 0) {
      // Lọc các variant objects và chỉ lấy variant values được chọn
      const selectedVariantObjects = availableVariants
        .filter(v => selectedVariants.includes(v.id))
        .map(variant => ({
          ...variant,
          variantValues: variant.variantValues.filter(vv =>
            selectedVariantValues[variant.id]?.includes(vv.id)
          )
        }))
        .filter(variant => variant.variantValues.length > 0); // Chỉ lấy variant có ít nhất 1 value được chọn

      return generateVariantCombinations(selectedVariantObjects);
    }
    return [];
  }, [selectedVariants, availableVariants, selectedVariantValues, generateVariantCombinations]);

  // Cập nhật formData khi variant combinations thay đổi
  useEffect(() => {
    if (variantCombinations.length > 0) {
      setFormData(prev => {
        // Nếu đang edit product và đã có variants, giữ nguyên dữ liệu cũ
        if (product && prev.variants && prev.variants.length > 0) {
          return prev;
        }
        
        // Nếu là add mode hoặc chưa có variants, tạo mới
        return {
          ...prev,
          variants: variantCombinations.map(combo => ({
            price: 0,
            oldPrice: 0,
            sku: "",
            stock: 0,
            variantValueIds: combo.variantValueIds
          }))
        };
      });
    }
  }, [variantCombinations, product]);

  // Xử lý chọn/bỏ chọn variant
  const handleVariantSelection = (variantId: number, checked: boolean) => {
    if (checked) {
      setSelectedVariants(prev => [...prev, variantId]);
      // Khởi tạo danh sách variant values trống cho variant mới
      setSelectedVariantValues(prev => ({
        ...prev,
        [variantId]: []
      }));
    } else {
      setSelectedVariants(prev => prev.filter(id => id !== variantId));
      // Xóa variant values của variant bị bỏ chọn
      setSelectedVariantValues(prev => {
        const newState = { ...prev };
        delete newState[variantId];
        return newState;
      });
    }
  };

  // Xử lý chọn/bỏ chọn variant value
  const handleVariantValueSelection = (variantId: number, variantValueId: number, checked: boolean) => {
    setSelectedVariantValues(prev => {
      const currentValues = prev[variantId] || [];
      if (checked) {
        return {
          ...prev,
          [variantId]: [...currentValues, variantValueId]
        };
      } else {
        return {
          ...prev,
          [variantId]: currentValues.filter(id => id !== variantValueId)
        };
      }
    });
  };

  // Áp dụng giá trị cho tất cả phân loại
  const handleApplyToAll = () => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.map(variant => ({
        ...variant,
        price: bulkPrice,
        stock: bulkStock,
        sku: bulkSku
      })) || []
    }));
    toast.success("Đã áp dụng giá trị cho tất cả phân loại");
  };

  const handleThumbnailFiles = (files: File[]) => {
    // Thumbnail chỉ cho phép 1 file, thay thế file cũ
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
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewProductImageUrls((prev) => [...prev, ...urls]);
  };

  const removeThumbnail = () => {
    setSelectedThumbnailFile(null);
    setPreviewThumbnailUrl("");
    setFormData((prev) => ({
      ...prev,
      thumbnail: "",
    }));
  };

  const removeProductImage = (index: number) => {
    setSelectedProductImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewProductImageUrls((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
    }));
  };

  const handleAttributeChange = (
    index: number,
    field: keyof ProductAttributeRequest,
    value: any
  ) => {
    const updated = [...(formData.attributes || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, attributes: updated }));
  };

  const handleVariantChange = (
    index: number,
    field: keyof ProductVariantRequest,
    value: any
  ) => {
    const updated = [...(formData.variants || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let finalThumbnail = formData.thumbnail;
      let finalProductImages = [...formData.productImages];

      // Lấy nội dung từ Quill editor và xử lý upload ảnh trong editor
      let editorHtml = "";
      if (quillRef.current) {
        editorHtml = quillRef.current.root.innerHTML || "";
        
        // Xử lý upload ảnh trong editor (tương tự như NewsCreate)
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
        const uploadResponse = await uploadService.uploadImage([selectedThumbnailFile]);
        if (uploadResponse.data && uploadResponse.data.length > 0) {
          finalThumbnail = uploadResponse.data[0];
        } else {
          toast.error("Không thể upload hình ảnh thumbnail");
          return;
        }
        setIsUploading(false);
      }

      // Upload product images (riêng biệt với thumbnail)
      if (selectedProductImageFiles.length > 0) {
        setIsUploading(true);
        const uploadResponse = await uploadService.uploadImage(selectedProductImageFiles);
        if (uploadResponse.data && uploadResponse.data.length > 0) {
          finalProductImages = [...finalProductImages, ...uploadResponse.data];
        } else {
          toast.error("Không thể upload hình ảnh sản phẩm");
          return;
        }
        setIsUploading(false);
      }

      const submitData: CreateProductRequest = {
        ...formData,
        description: editorHtml,
        thumbnail: finalThumbnail,
        productImages: finalProductImages,
      };

      onSubmit(submitData);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Có lỗi xảy ra khi upload hình ảnh");
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          Thông tin cơ bản
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tên sản phẩm */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Tên sản phẩm <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Nhập tên sản phẩm"
              required
              disabled={isLoading || isUploading}
            />
          </div>

          {/* SPU */}
          <div className="space-y-2">
            <Label htmlFor="spu" className="text-sm font-medium text-gray-700">
              SPU <span className="text-red-500">*</span>
            </Label>
            <Input
              id="spu"
              value={formData.spu}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, spu: e.target.value }))
              }
              placeholder="Nhập mã SPU"
              required
              disabled={isLoading || isUploading}
            />
          </div>

          {/* Danh mục */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Danh mục <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.categoryId ? formData.categoryId.toString() : ""}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, categoryId: parseInt(value) }))
              }
              disabled={isLoading || isUploading || isLoadingCategories}
            >
              <SelectTrigger className="min-w-full">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Thương hiệu */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Thương hiệu <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.brandId ? formData.brandId.toString() : ""}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, brandId: parseInt(value) }))
              }
              disabled={isLoading || isUploading || isLoadingBrands}
            >
              <SelectTrigger className="min-w-full">
                <SelectValue placeholder="Chọn thương hiệu" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


        </div>

        {/* Mô tả */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Mô tả sản phẩm
          </Label>
          <RichTextEditor
            ref={quillRef}
            defaultValue={formData.description}
            placeholder="Nhập mô tả chi tiết về sản phẩm..."
            className="min-h-[200px]"
          />
        </div>
      </div>

      {/* Thông tin bán hàng */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          Thông tin bán hàng
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Số lượng */}
          <div className="space-y-2">
            <Label htmlFor="stock" className="text-sm font-medium text-gray-700">
              Số lượng tồn kho
            </Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  stock: parseInt(e.target.value),
                }))
              }
              placeholder="0"
              min={0}
              disabled={isLoading || isUploading}
            />
          </div>

          {/* Giảm giá */}
          <div className="space-y-2">
            <Label htmlFor="discount" className="text-sm font-medium text-gray-700">
              Tỷ lệ giảm giá
            </Label>
            <div className="relative">
              <Input
                id="discount"
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discount: parseFloat(e.target.value),
                  }))
                }
                placeholder="0.00"
                min={0}
                max={1}
                disabled={isLoading || isUploading}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                %
              </span>
            </div>
          </div>

          {/* Trạng thái */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Trạng thái
            </Label>
            <div className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, status: checked }))
                }
                disabled={isLoading || isUploading}
              />
              <Label htmlFor="status" className="text-sm font-medium">
                {formData.status ? "Hoạt động" : "Không hoạt động"}
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Hình ảnh sản phẩm */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          Hình ảnh sản phẩm
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Thumbnail */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Hình đại diện
              </Label>
              <p className="text-xs text-gray-500">
                Hình ảnh chính hiển thị trong danh sách sản phẩm
              </p>
            </div>

            <FileUpload
              onFilesSelected={handleThumbnailFiles}
              accept="image/*"
              multiple={false}
              maxFiles={1}
              disabled={isLoading || isUploading}
              variant="thumbnail"
              placeholder="Nhấp để chọn hoặc kéo thả hình ảnh vào đây"
              description="PNG, JPG, GIF tối đa 10MB"
            />

            {previewThumbnailUrl && (
              <div className="relative inline-block">
                <img
                  src={previewThumbnailUrl}
                  alt="Thumbnail preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  disabled={isLoading || isUploading}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Hình ảnh chi tiết */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Hình ảnh chi tiết <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-gray-500">
                Nhiều hình ảnh để hiển thị chi tiết sản phẩm
              </p>
            </div>

            <FileUpload
              onFilesSelected={handleProductImageFiles}
              accept="image/*"
              multiple={true}
              disabled={isLoading || isUploading}
              variant="product"
              placeholder="Nhấp để chọn hoặc kéo thả nhiều hình ảnh vào đây"
              description="Chọn nhiều hình ảnh để hiển thị chi tiết sản phẩm. PNG, JPG, GIF tối đa 10MB mỗi file"
            />

            <ImagePreviewGrid
              images={previewProductImageUrls}
              onRemove={removeProductImage}
              disabled={isLoading || isUploading}
              variant="product"
            />
          </div>
        </div>
      </div>

      {/* Thuộc tính sản phẩm */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          Thuộc tính sản phẩm
        </h3>

        {categoryAttributes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categoryAttributes.map((attr, i) => (
              <div key={attr.id} className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {attr.name}
                </Label>
                <Input
                  placeholder={`Nhập ${attr.name.toLowerCase()}`}
                  value={formData.attributes?.[i]?.value || ""}
                  onChange={(e) =>
                    handleAttributeChange(i, "value", e.target.value)
                  }
                  disabled={isLoading || isUploading}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              {formData.categoryId ? "Danh mục này không có thuộc tính nào" : "Vui lòng chọn danh mục để hiển thị thuộc tính"}
            </p>
          </div>
        )}
      </div>

      {/* Biến thể sản phẩm */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          Biến thể sản phẩm
        </h3>

        {/* Chọn variants */}
        {!formData.categoryId ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              Vui lòng chọn danh mục để hiển thị các biến thể
            </p>
          </div>
        ) : availableVariants.length > 0 ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Chọn các biến thể:</Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {availableVariants.map((variant) => (
                  <div key={variant.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        id={`variant-${variant.id}`}
                        checked={selectedVariants.includes(variant.id)}
                        onChange={(e) => handleVariantSelection(variant.id, e.target.checked)}
                        disabled={isLoading || isUploading || isLoadingVariants}
                        className="rounded h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor={`variant-${variant.id}`} className="text-sm font-medium text-gray-900">
                        {variant.name}
                      </Label>
                    </div>

                    {/* Hiển thị variant values khi variant được chọn */}
                    {selectedVariants.includes(variant.id) && (
                      <div className="ml-7 space-y-3">
                        <Label className="text-xs font-medium text-gray-600">Chọn các giá trị:</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {variant.variantValues.map((variantValue) => (
                            <div key={variantValue.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`variant-value-${variantValue.id}`}
                                checked={selectedVariantValues[variant.id]?.includes(variantValue.id) || false}
                                onChange={(e) => handleVariantValueSelection(variant.id, variantValue.id, e.target.checked)}
                                disabled={isLoading || isUploading}
                                className="rounded h-3 w-3 text-blue-600 focus:ring-blue-500"
                              />
                              <Label htmlFor={`variant-value-${variantValue.id}`} className="text-xs text-gray-700">
                                {variantValue.value}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              {isLoadingVariants ? "Đang tải biến thể..." : "Danh mục này không có biến thể nào"}
            </p>
          </div>
        )}

        {/* Hiển thị variant combinations dưới dạng bảng */}
        {variantCombinations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                Danh sách phân loại hàng ({variantCombinations.length} phân loại)
              </Label>
            </div>

            {/* Bulk edit section */}
            <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
              <Label className="text-sm font-medium text-gray-700">Cài đặt hàng loạt:</Label>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Giá</Label>
                  <Input
                    placeholder="0"
                    type="number"
                    value={bulkPrice || ""}
                    onChange={(e) => setBulkPrice(parseFloat(e.target.value) || 0)}
                    disabled={isLoading || isUploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Kho hàng</Label>
                  <Input
                    placeholder="0"
                    type="number"
                    value={bulkStock || ""}
                    onChange={(e) => setBulkStock(parseInt(e.target.value) || 0)}
                    disabled={isLoading || isUploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">SKU phân loại</Label>
                  <Input
                    placeholder="Mã SKU"
                    value={bulkSku}
                    onChange={(e) => setBulkSku(e.target.value)}
                    disabled={isLoading || isUploading}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleApplyToAll}
                    disabled={isLoading || isUploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Áp dụng cho tất cả
                  </Button>
                </div>
              </div>
            </div>

            {/* Bảng hiển thị variant combinations */}
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      Phân loại
                    </th>
                    {selectedVariants.map((variantId) => {
                      const variant = availableVariants.find(v => v.id === variantId);
                      return (
                        <th key={variantId} className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                          {variant?.name}
                        </th>
                      );
                    })}
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      * Giá
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      * Kho hàng
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      SKU phân loại
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {variantCombinations.map((combo, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Phân loại #{i + 1}
                      </td>
                      {selectedVariants.map((variantId) => {
                        const variantValue = combo.combination.find((item: any) =>
                          availableVariants.find(v => v.id === variantId)?.variantValues.some(vv => vv.id === item.id)
                        );
                        return (
                          <td key={variantId} className="px-4 py-3 text-sm text-gray-700">
                            {variantValue?.value || "-"}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3">
                        <Input
                          placeholder="0"
                          type="number"
                          value={formData.variants?.[i]?.price || ""}
                          onChange={(e) =>
                            handleVariantChange(i, "price", parseFloat(e.target.value) || 0)
                          }
                          disabled={isLoading || isUploading}
                          className="w-full border-0 focus:ring-0 bg-transparent"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          placeholder="0"
                          type="number"
                          value={formData.variants?.[i]?.stock || ""}
                          onChange={(e) =>
                            handleVariantChange(i, "stock", parseInt(e.target.value) || 0)
                          }
                          disabled={isLoading || isUploading}
                          className="w-full border-0 focus:ring-0 bg-transparent"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          placeholder="Mã SKU"
                          value={formData.variants?.[i]?.sku || ""}
                          onChange={(e) => handleVariantChange(i, "sku", e.target.value)}
                          disabled={isLoading || isUploading}
                          className="w-full border-0 focus:ring-0 bg-transparent"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || isUploading}
            className="w-full sm:w-auto"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isUploading}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {isLoading || isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              submitButtonText || (product ? "Cập nhật sản phẩm" : "Thêm sản phẩm")
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
