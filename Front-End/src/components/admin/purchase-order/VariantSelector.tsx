import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import type { Product } from "@/types/product.type";
import { cn } from "@/lib/utils";

// Removed duplicate interface

interface VariantSelectorProps {
  product: Product;
  selectedVariantIds: number[];
  onSelectVariant: (variantId: number) => void;
}

export default function VariantSelector({
  product,
  selectedVariantIds,
  onSelectVariant,
}: VariantSelectorProps) {
  const variantsWithValues = useMemo(() => {
    return product.variants.map((variant) => {
      const variantValues = variant.productVariantValues
        .map((pvv) => pvv.variantValue.value)
        .join(" / ");
      return {
        ...variant,
        variantValues,
      };
    });
  }, [product.variants]);

  return (
    <div className="space-y-4 p-5 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200"
        />
        <div className="flex-1">
          <Label className="text-base font-semibold text-gray-900">
            Chọn biến thể của "{product.name}"
          </Label>
          <p className="text-xs text-gray-500 mt-0.5">
            {product.variants.length} biến thể có sẵn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {variantsWithValues.map((variant) => {
          const isSelected = selectedVariantIds.includes(variant.id);
          const stockStatus = variant.stock > 0 ? "available" : "outOfStock";

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelectVariant(variant.id)}
              disabled={variant.stock === 0}
              className={cn(
                "relative group p-4 rounded-lg border-2 transition-all duration-200 text-left",
                "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50",
                variant.stock === 0 && "opacity-60 cursor-not-allowed"
              )}
            >
              {/* Check icon khi được chọn */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in-95 duration-200">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <p
                    className={cn(
                      "font-semibold text-sm mb-1.5 line-clamp-2",
                      isSelected ? "text-blue-700" : "text-gray-900"
                    )}
                  >
                    {variant.variantValues}
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      SKU: {variant.sku}
                    </span>
                    <span
                      className={cn(
                        "font-medium px-2 py-0.5 rounded",
                        stockStatus === "available"
                          ? "text-green-700 bg-green-100"
                          : "text-red-700 bg-red-100"
                      )}
                    >
                      {variant.stock > 0 ? `Tồn: ${variant.stock}` : "Hết hàng"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Giá:</span>
                  <span
                    className={cn(
                      "font-bold text-sm",
                      isSelected ? "text-blue-600" : "text-gray-700"
                    )}
                  >
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(variant.price)}
                  </span>
                </div>
              </div>

              {/* Hover effect overlay */}
              {!isSelected && (
                <div className="absolute inset-0 rounded-lg bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

