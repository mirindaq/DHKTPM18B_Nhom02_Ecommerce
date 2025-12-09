import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomBadge } from "@/components/ui/CustomBadge";
import type { Product } from "@/types/product.type";
import {
  Package,
  Tag,
  Image as ImageIcon,
  ShoppingCart,
  DollarSign,
  Barcode,
  Info,
} from "lucide-react";

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function ProductDetailDialog({
  open,
  onOpenChange,
  product,
}: ProductDetailDialogProps) {
  const [selectedImage, setSelectedImage] = React.useState<string>("");

  React.useEffect(() => {
    if (product?.thumbnail) {
      setSelectedImage(product.thumbnail);
    }
  }, [product]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-w-[90vw] p-0 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-5 pt-5 pb-3 border-b bg-gray-50">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Chi tiết sản phẩm
          </DialogTitle>
          <DialogDescription className="text-sm mt-1 text-gray-600">
            {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-4">
            {/* THÔNG TIN CHÍNH: Bố cục 2 cột (Hình ảnh + Thông tin cơ bản) */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* CỘT 1: Hình ảnh sản phẩm */}
              <div className="lg:w-2/5 space-y-3">
                <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg bg-white">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <ImageIcon className="h-32 w-32 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Hình ảnh phụ */}
                {product.productImages && product.productImages.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-600">
                      Album ảnh ({product.productImages.length})
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {product.productImages.slice(0, 8).map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedImage(img)}
                          className={`aspect-square rounded-md overflow-hidden border ${
                            selectedImage === img
                              ? "border-blue-500 ring-1 ring-blue-300"
                              : "border-gray-300 hover:border-blue-400"
                          } transition-all duration-200 cursor-pointer group`}
                        >
                          <img
                            src={img}
                            alt={`${product.name} ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CỘT 2: Thông tin cơ bản */}
              <div className="lg:w-3/5 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {product.name}
                  </h3>
                </div>

                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Barcode className="h-4 w-4 text-gray-500" />
                      <p className="text-xs font-medium text-gray-600">Mã SPU</p>
                    </div>
                    <code className="text-sm font-semibold text-gray-900 block">
                      {product.spu}
                    </code>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-gray-500" />
                      <p className="text-xs font-medium text-gray-600">Trạng thái</p>
                    </div>
                    <CustomBadge
                      variant={product.status ? "success" : "secondary"}
                      className="text-sm"
                    >
                      {product.status ? "Hoạt động" : "Tạm dừng"}
                    </CustomBadge>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingCart className="h-4 w-4 text-gray-500" />
                      <p className="text-xs font-medium text-gray-600">Tồn kho</p>
                    </div>
                    <p className="text-base font-bold text-gray-900">
                      {product.stock ? product.stock.toLocaleString() : "0"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <p className="text-xs font-medium text-gray-600">Đánh giá</p>
                    </div>
                    <p className="text-base font-bold text-gray-900">
                      ⭐ {product.rating ? product.rating.toFixed(1) : "0.0"}
                    </p>
                  </div>
                </div>

                {/* Mô tả */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-gray-500" />
                    <h4 className="text-sm font-semibold text-gray-700">
                      Mô tả sản phẩm
                    </h4>
                  </div>
                  <div
                    className="text-xs text-gray-700 leading-relaxed max-h-32 overflow-y-auto bg-white p-3 rounded prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              </div>
            </div>

          {/* THUỘC TÍNH SẢN PHẨM */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-800">
                  Thuộc tính sản phẩm
                </h4>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                  {product.attributes.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {product.attributes.map((attr) => (
                  <div
                    key={attr.id}
                    className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {attr.attribute.name}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {attr.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BIẾN THỂ SẢN PHẨM */}
          {product.variants && product.variants.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-gray-800">
                    Biến thể sản phẩm
                  </h4>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                    {product.variants.length}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span className="text-gray-600">Thấp nhất:</span>
                    <span className="font-semibold text-green-700">
                      {formatPrice(
                        Math.min(...product.variants.map((v) => v.price))
                      )}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-blue-600" />
                    <span className="text-gray-600">Cao nhất:</span>
                    <span className="font-semibold text-blue-700">
                      {formatPrice(
                        Math.max(...product.variants.map((v) => v.price))
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2">
                {product.variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="bg-blue-500 text-white w-6 h-6 rounded flex items-center justify-center font-semibold text-xs flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {variant.productVariantValues.map((vv) => (
                            <CustomBadge
                              key={vv.id}
                              variant="info"
                              size="sm"
                              className="text-xs"
                            >
                              {vv.variantValue.variantName || "Thuộc tính"}:{" "}
                              {vv.variantValue.value}
                            </CustomBadge>
                          ))}
                        </div>
                      </div>
                      {variant.discount > 0 && (
                        <div className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0">
                          -{variant.discount}%
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <p className="text-xs text-gray-500 mb-0.5">SKU</p>
                        <code className="text-xs font-semibold text-gray-700 block truncate">
                          {variant.sku}
                        </code>
                      </div>
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <p className="text-xs text-gray-500 mb-0.5">Giá bán</p>
                        <p className="font-semibold text-green-600 text-sm">
                          {formatPrice(variant.price)}
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <p className="text-xs text-gray-500 mb-0.5">Tồn kho</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {variant.stock ? variant.stock.toLocaleString() : "0"}
                        </p>
                      </div>
                      {variant.oldPrice > variant.price && (
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-500 mb-0.5">Giá cũ</p>
                          <p className="font-semibold text-gray-500 text-sm line-through">
                            {formatPrice(variant.oldPrice)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t bg-gray-50">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="text-sm"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
