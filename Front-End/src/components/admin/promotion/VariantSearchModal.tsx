import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { productService } from "@/services/product.service";
import type { ProductVariantDescription } from "@/types/product.type";
import { Search, Check } from "lucide-react";

interface VariantSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProductIds: number[];
  selectedVariantIds: number[];
  onSelectVariant: (variant: ProductVariantDescription) => void;
}

export default function VariantSearchModal({
  open,
  onOpenChange,
  selectedProductIds,
  selectedVariantIds,
  onSelectVariant,
}: VariantSearchModalProps) {
  const [productVariants, setProductVariants] = useState<
    ProductVariantDescription[]
  >([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchKeyword("");
    }
  }, [open]);

  // Load variants when products are selected
  useEffect(() => {
    if (selectedProductIds.length > 0 && open) {
      const loadVariants = async () => {
        setLoadingVariants(true);
        try {
          const allVariants: ProductVariantDescription[] = [];
          for (const productId of selectedProductIds) {
            try {
              const response = await productService.getSkusForPromotion(
                productId
              );
              allVariants.push(...(response.data || []));
            } catch (error) {
              console.error(
                `Error loading variants for product ${productId}:`,
                error
              );
            }
          }
          setProductVariants(allVariants);
        } catch (error) {
          console.error("Error loading variants:", error);
        } finally {
          setLoadingVariants(false);
        }
      };
      loadVariants();
    } else {
      setProductVariants([]);
    }
  }, [selectedProductIds.join(","), open]);

  const handleToggleVariant = (variant: ProductVariantDescription) => {
    onSelectVariant(variant);
  };

  const filteredVariants = productVariants.filter(
    (variant) =>
      variant.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      variant.sku.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Tìm kiếm biến thể
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="relative">
            <Input
              placeholder="Tìm kiếm biến thể (tên, SKU)..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="h-12 pl-10"
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <div className="flex-1 overflow-y-auto">
            {selectedProductIds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">
                  Vui lòng chọn sản phẩm trước để tìm kiếm biến thể
                </p>
              </div>
            ) : loadingVariants ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
                <p className="text-gray-500 text-sm">Đang tải biến thể...</p>
              </div>
            ) : filteredVariants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium mb-1">
                  {searchKeyword
                    ? "Không tìm thấy biến thể"
                    : "Không có biến thể"}
                </p>
                <p className="text-gray-400 text-sm">
                  {searchKeyword
                    ? "Thử tìm kiếm với từ khóa khác"
                    : "Vui lòng chọn sản phẩm có biến thể"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredVariants.map((variant) => {
                  const isSelected = selectedVariantIds.includes(variant.id);
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => handleToggleVariant(variant)}
                      className={`w-full flex items-center gap-4 p-4 hover:bg-blue-50 active:bg-blue-100 transition-all duration-150 text-left border rounded-lg group hover:border-blue-300 hover:shadow-sm ${
                        isSelected
                          ? "bg-blue-50 border-blue-300"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        {variant.thumbnail ? (
                          <img
                            src={variant.thumbnail}
                            alt={variant.name}
                            className={`w-16 h-16 object-cover rounded-lg border-2 transition-colors ${
                              isSelected
                                ? "border-blue-300"
                                : "border-gray-200 group-hover:border-blue-300"
                            }`}
                            loading="lazy"
                          />
                        ) : (
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center border-2 transition-colors ${
                            isSelected
                              ? "bg-green-100 border-green-300"
                              : "bg-green-100 border-green-200 group-hover:border-green-300"
                          }`}>
                            <span className="text-2xl">📦</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold text-base line-clamp-1 transition-colors ${
                            isSelected
                              ? "text-blue-600"
                              : "text-gray-900 group-hover:text-blue-600"
                          }`}
                        >
                          {variant.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">
                            SKU: {variant.sku}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Xong ({selectedVariantIds.length} đã chọn)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

