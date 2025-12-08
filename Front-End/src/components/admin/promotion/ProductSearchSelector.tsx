import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useDebounce } from "@/hooks";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product.type";
import { Search, ChevronDown, Check, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductSearchSelectorProps {
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

export default function ProductSearchSelector({
  selectedIds,
  onSelectionChange,
}: ProductSearchSelectorProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchKeyword, 500);

  const { data: productsData, isLoading: isLoadingProducts } = useQuery(
    () =>
      productService.getProducts(1, 100, {
        keyword: debouncedSearch,
        status: true,
      }),
    {
      queryKey: ["products-search-promotion", debouncedSearch],
      enabled: debouncedSearch.length > 0,
    }
  );

  const products = productsData?.data?.data || [];

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

  const handleToggleProduct = (productId: number) => {
    const isSelected = selectedIds.includes(productId);
    const newIds = isSelected
      ? selectedIds.filter((id) => id !== productId)
      : [...selectedIds, productId];
    onSelectionChange(newIds);
  };

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

  return (
    <div className="space-y-4">
      <div className="relative" ref={dropdownRef}>
        <Label className="text-base font-medium mb-2 block">
          Tìm kiếm và chọn sản phẩm
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Nhập tên sản phẩm để tìm kiếm..."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className="h-12 pl-10 pr-10"
            disabled={isLoadingProducts}
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
            {!searchKeyword ? (
              <div className="p-4 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Nhập từ khóa để tìm kiếm sản phẩm
                </p>
              </div>
            ) : isLoadingProducts ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Đang tải...
              </div>
            ) : products.length === 0 ? (
              <div className="p-4 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium mb-1">
                  Không tìm thấy sản phẩm
                </p>
                <p className="text-xs text-gray-400">
                  Thử tìm kiếm với từ khóa khác
                </p>
              </div>
            ) : (
              <div className="py-1 max-h-80 overflow-y-auto">
                {products.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleToggleProduct(product.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 hover:bg-blue-50 transition-colors text-left",
                        isSelected && "bg-blue-50"
                      )}
                    >
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-medium text-sm line-clamp-1",
                            isSelected ? "text-blue-600" : "text-gray-900"
                          )}
                        >
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {product.variants.length} biến thể
                          </span>
                        </div>
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

      {/* Selected products */}
      {selectedProducts.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">
            Đã chọn {selectedProducts.length} sản phẩm
          </h4>
          <div className="space-y-2">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-white border border-blue-300 rounded-md"
              >
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded-lg border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-700 line-clamp-1">
                    {product.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleProduct(product.id)}
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

