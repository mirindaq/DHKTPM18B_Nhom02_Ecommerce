import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { productService } from "@/services/product.service";
import type { ProductVariantDescription } from "@/types/product.type";
import { Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariantSearchSelectorProps {
  selectedProductIds: number[];
  selectedVariantIds: number[];
  onVariantSelectionChange: (ids: number[]) => void;
}

export default function VariantSearchSelector({
  selectedProductIds,
  selectedVariantIds,
  onVariantSelectionChange,
}: VariantSearchSelectorProps) {
  const [productVariants, setProductVariants] = useState<
    ProductVariantDescription[]
  >([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load variants when products are selected
  useEffect(() => {
    if (selectedProductIds.length > 0) {
      const loadVariants = async () => {
        setLoadingVariants(true);
        try {
          const allVariants: ProductVariantDescription[] = [];
          for (const productId of selectedProductIds) {
            try {
              const response = await productService.getSkusForPromotion(productId);
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
  }, [selectedProductIds.join(",")]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleToggleVariant = (variantId: number) => {
    const isSelected = selectedVariantIds.includes(variantId);
    const newIds = isSelected
      ? selectedVariantIds.filter((id) => id !== variantId)
      : [...selectedVariantIds, variantId];
    onVariantSelectionChange(newIds);
  };

  const filteredVariants = productVariants.filter(
    (variant) =>
      variant.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      variant.sku.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const selectedVariants = productVariants.filter((v) =>
    selectedVariantIds.includes(v.id)
  );

  if (selectedProductIds.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <p className="text-gray-500 text-sm">
          Vui lòng chọn sản phẩm trước để chọn biến thể
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative" ref={dropdownRef}>
        <Label className="text-base font-medium mb-2 block">
          Tìm kiếm và chọn biến thể
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Tìm kiếm biến thể (tên, SKU)..."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className="h-12 pl-10 pr-10"
            disabled={loadingVariants}
          />
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                isDropdownOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {loadingVariants ? (
              <div className="p-4 text-center text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                Đang tải...
              </div>
            ) : filteredVariants.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">
                  {searchKeyword
                    ? "Không tìm thấy biến thể"
                    : "Không có biến thể"}
                </p>
              </div>
            ) : (
              <div className="py-1 max-h-80 overflow-y-auto">
                {filteredVariants.map((variant) => {
                  const isSelected = selectedVariantIds.includes(variant.id);
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => handleToggleVariant(variant.id)}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 p-3 hover:bg-blue-50 transition-colors text-left",
                        isSelected && "bg-blue-50"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-medium text-sm line-clamp-1",
                            isSelected ? "text-blue-600" : "text-gray-900"
                          )}
                        >
                          {variant.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          SKU: {variant.sku}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected variants */}
      {selectedVariants.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">
            Đã chọn {selectedVariants.length} biến thể
          </h4>
          <div className="space-y-2">
            {selectedVariants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center gap-3 p-3 bg-white border border-blue-300 rounded-md"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-700 line-clamp-1">
                    {variant.name}
                  </p>
                  <p className="text-xs text-gray-500">SKU: {variant.sku}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleVariant(variant.id)}
                  className="text-blue-600 hover:text-blue-800 text-lg font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

