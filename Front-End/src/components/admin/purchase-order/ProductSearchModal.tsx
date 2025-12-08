import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery, useDebounce } from "@/hooks";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product.type";
import { Search, Package } from "lucide-react";

interface ProductSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProduct: (product: Product) => void;
}

export default function ProductSearchModal({
  open,
  onOpenChange,
  onSelectProduct,
}: ProductSearchModalProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedSearch = useDebounce(searchKeyword, 500);

  const { data: productsData, isLoading: isLoadingProducts } = useQuery(
    () => productService.getProducts(1, 100, { keyword: debouncedSearch, status: true }),
    {
      queryKey: ["products-search-modal", debouncedSearch],
      enabled: debouncedSearch.length > 0,
    }
  );

  const products = productsData?.data?.data || [];

  const handleSelectProduct = useCallback(
    (product: Product) => {
      onSelectProduct(product);
      setSearchKeyword("");
      onOpenChange(false);
    },
    [onSelectProduct, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Tìm kiếm sản phẩm
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="relative">
            <Input
              placeholder="Nhập tên sản phẩm để tìm kiếm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="h-12 pl-10"
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <div className="flex-1 overflow-y-auto">
            {!debouncedSearch ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">
                  Nhập từ khóa để tìm kiếm sản phẩm
                </p>
              </div>
            ) : isLoadingProducts ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4 animate-pulse border rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium mb-1">Không tìm thấy sản phẩm</p>
                <p className="text-gray-400 text-sm">Thử tìm kiếm với từ khóa khác</p>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 active:bg-blue-100 transition-all duration-150 text-left border border-gray-200 rounded-lg group hover:border-blue-300 hover:shadow-sm"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-300 transition-colors"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {product.variants.length} biến thể
                        </span>
                        {product.variants.length > 0 && (
                          <span className="text-xs text-green-600 font-medium">
                            Còn hàng
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

