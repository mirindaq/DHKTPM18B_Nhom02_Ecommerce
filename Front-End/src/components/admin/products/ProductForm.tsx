import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X, Upload, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { uploadService } from "@/services/upload.service";
import type {
  Product,
  CreateProductRequest,
  ProductAttributeRequest,
  ProductVariantRequest,
} from "@/types/product.type";

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: CreateProductRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading,
}: ProductFormProps) {
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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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
      setPreviewUrls(product.productImages || []);
    }
  }, [product]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
      const urls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...urls]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
    }));
  };

  const handleAddAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...(prev.attributes || []), { attributeId: 0, value: "" }],
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

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        { price: 0, oldPrice: 0, sku: "", stock: 0, variantValueIds: [] },
      ],
    }));
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
      let finalImages = [...formData.productImages];

      if (selectedFiles.length > 0) {
        setIsUploading(true);
        const uploadResponse = await uploadService.uploadImage(selectedFiles);
        if (uploadResponse.data && uploadResponse.data.length > 0) {
          finalImages = [...finalImages, ...uploadResponse.data];
        } else {
          toast.error("Không thể upload hình ảnh");
          return;
        }
        setIsUploading(false);
      }

      const submitData: CreateProductRequest = {
        ...formData,
        productImages: finalImages,
      };

      onSubmit(submitData);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Có lỗi xảy ra khi upload hình ảnh");
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tên sản phẩm */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right font-medium text-gray-700">
          Tên sản phẩm <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="col-span-3"
          required
          disabled={isLoading || isUploading}
        />
      </div>

      {/* SPU */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="spu" className="text-right font-medium text-gray-700">
          SPU <span className="text-red-500">*</span>
        </Label>
        <Input
          id="spu"
          value={formData.spu}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, spu: e.target.value }))
          }
          className="col-span-3"
          required
          disabled={isLoading || isUploading}
        />
      </div>

      {/* Stock & Discount */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="stock" className="text-right font-medium text-gray-700">
          Số lượng
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
          className="col-span-3"
          min={0}
          disabled={isLoading || isUploading}
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          htmlFor="discount"
          className="text-right font-medium text-gray-700"
        >
          Giảm giá
        </Label>
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
          className="col-span-3"
          min={0}
          max={1}
          disabled={isLoading || isUploading}
        />
      </div>

      {/* Mô tả */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          htmlFor="description"
          className="text-right font-medium text-gray-700"
        >
          Mô tả
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="col-span-3"
          rows={3}
          disabled={isLoading || isUploading}
        />
      </div>

      {/* Trạng thái */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          htmlFor="status"
          className="text-right font-medium text-gray-700"
        >
          Trạng thái
        </Label>
        <div className="col-span-3 flex items-center space-x-2">
          <Switch
            id="status"
            checked={formData.status}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, status: checked }))
            }
            disabled={isLoading || isUploading}
          />
          <Label htmlFor="status" className="text-sm text-gray-600">
            {formData.status ? "Hoạt động" : "Không hoạt động"}
          </Label>
        </div>
      </div>

      {/* Upload nhiều ảnh */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right font-medium text-gray-700 pt-2">
          Hình ảnh
        </Label>
        <div className="col-span-3 space-y-3">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={isLoading || isUploading}
          />

          <div className="flex flex-wrap gap-3">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative inline-block">
                <img
                  src={url}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 text-white hover:bg-red-600 border-0"
                  disabled={isLoading || isUploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attributes */}
      <div className="space-y-2">
        <Label className="font-medium text-gray-700">Thuộc tính</Label>
        {formData.attributes?.map((attr, i) => (
          <div key={i} className="flex space-x-2">
            <Input
              placeholder="Attribute ID"
              type="number"
              value={attr.attributeId}
              onChange={(e) =>
                handleAttributeChange(
                  i,
                  "attributeId",
                  parseInt(e.target.value)
                )
              }
              className="w-1/3"
            />
            <Input
              placeholder="Giá trị"
              value={attr.value}
              onChange={(e) =>
                handleAttributeChange(i, "value", e.target.value)
              }
              className="flex-1"
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddAttribute}
        >
          <Plus className="h-4 w-4 mr-2" /> Thêm thuộc tính
        </Button>
      </div>

      {/* Variants */}
      <div className="space-y-2">
        <Label className="font-medium text-gray-700">Biến thể</Label>
        {formData.variants?.map((variant, i) => (
          <div key={i} className="grid grid-cols-5 gap-2 items-center">
            <Input
              placeholder="Giá"
              type="number"
              value={variant.price}
              onChange={(e) =>
                handleVariantChange(i, "price", parseFloat(e.target.value))
              }
            />
            <Input
              placeholder="Giá cũ"
              type="number"
              value={variant.oldPrice || 0}
              onChange={(e) =>
                handleVariantChange(i, "oldPrice", parseFloat(e.target.value))
              }
            />
            <Input
              placeholder="SKU"
              value={variant.sku}
              onChange={(e) => handleVariantChange(i, "sku", e.target.value)}
            />
            <Input
              placeholder="Số lượng"
              type="number"
              value={variant.stock}
              onChange={(e) =>
                handleVariantChange(i, "stock", parseInt(e.target.value))
              }
            />
            <Input
              placeholder="VariantValueIds (comma)"
              value={variant.variantValueIds.join(",")}
              onChange={(e) =>
                handleVariantChange(
                  i,
                  "variantValueIds",
                  e.target.value
                    .split(",")
                    .map((v) => parseInt(v.trim()))
                    .filter(Boolean)
                )
              }
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddVariant}
        >
          <Plus className="h-4 w-4 mr-2" /> Thêm biến thể
        </Button>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || isUploading}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isUploading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading || isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : product ? (
            "Cập nhật"
          ) : (
            "Thêm"
          )}
        </Button>
      </div>
    </form>
  );
}
