import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Package, Search, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useDebounce } from "@/hooks";
import { supplierService } from "@/services/supplier.service";
import type { Product } from "@/types/product.type";
import type { SupplierListResponse } from "@/types/supplier.type";
import type { CreatePurchaseOrderRequest, PurchaseOrderDetailRequest } from "@/types/purchase-order.type";
import ProductSearchModal from "./ProductSearchModal";
import VariantSelector from "./VariantSelector";

interface SelectedVariant {
  productVariantId: number;
  productName: string;
  sku: string;
  thumbnail: string;
  variantValues: string;
  currentStock: number;
  quantity: number;
  price: number;
}

interface PurchaseOrderFormProps {
  onSubmit: (data: CreatePurchaseOrderRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
  submitButtonText: string;
}

export default function PurchaseOrderForm({
  onSubmit,
  onCancel,
  isLoading,
  submitButtonText,
}: PurchaseOrderFormProps) {
  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);
  const [supplierSearchKeyword, setSupplierSearchKeyword] = useState("");
  const [isProductSearchModalOpen, setIsProductSearchModalOpen] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  // Debounce cho tìm kiếm supplier
  const debouncedSupplierSearch = useDebounce(supplierSearchKeyword, 500);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSupplierDropdownOpen(false);
      }
    };

    if (isSupplierDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSupplierDropdownOpen]);

  // Lấy danh sách suppliers (chỉ lấy các supplier đang active, có tìm kiếm)
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useQuery<SupplierListResponse>(
    () => supplierService.getSuppliers({
      page: 1,
      size: 100,
      status: "true",
      name: debouncedSupplierSearch || undefined,
    }),
    {
      queryKey: ["suppliers-for-purchase", debouncedSupplierSearch],
    }
  );

  const suppliers = suppliersData?.data?.data || [];

  const handleProductSelect = useCallback((product: Product) => {
    // Kiểm tra xem sản phẩm đã được thêm chưa
    if (selectedProducts.some((p) => p.id === product.id)) {
      return;
    }
    setSelectedProducts((prev) => [...prev, product]);
    setExpandedProductId(product.id);
  }, [selectedProducts]);

  const handleRemoveProduct = useCallback((productId: number) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    // Xóa tất cả biến thể của sản phẩm này
    setSelectedVariants((prev) => {
      const product = selectedProducts.find((p) => p.id === productId);
      if (!product) return prev;
      const variantIds = product.variants.map((v) => v.id);
      return prev.filter((v) => !variantIds.includes(v.productVariantId));
    });
    if (expandedProductId === productId) {
      setExpandedProductId(null);
    }
  }, [selectedProducts, expandedProductId]);

  const handleAddVariant = useCallback((productId: number, variantId: number) => {
    const product = selectedProducts.find((p) => p.id === productId);
    if (!product) return;

    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return;

    // Toggle: Nếu đã chọn thì bỏ chọn, chưa chọn thì thêm
    const isAlreadySelected = selectedVariants.some((v) => v.productVariantId === variantId);
    
    if (isAlreadySelected) {
      // Bỏ chọn biến thể
      setSelectedVariants((prev) => prev.filter((v) => v.productVariantId !== variantId));
    } else {
      // Thêm biến thể mới
      const variantValues = variant.productVariantValues
        .map((pvv) => pvv.variantValue.value)
        .join(" / ");

      const newVariant: SelectedVariant = {
        productVariantId: variant.id,
        productName: product.name,
        sku: variant.sku,
        thumbnail: product.thumbnail,
        variantValues,
        currentStock: variant.stock,
        quantity: 1,
        price: variant.price,
      };

      setSelectedVariants((prev) => [...prev, newVariant]);
    }
  }, [selectedProducts, selectedVariants]);

  const handleRemoveVariant = (variantId: number) => {
    setSelectedVariants(selectedVariants.filter((v) => v.productVariantId !== variantId));
  };

  const handleQuantityChange = (variantId: number, quantity: number) => {
    setSelectedVariants(
      selectedVariants.map((v) =>
        v.productVariantId === variantId ? { ...v, quantity: Math.max(1, quantity) } : v
      )
    );
  };

  const handlePriceChange = (variantId: number, price: number) => {
    setSelectedVariants(
      selectedVariants.map((v) =>
        v.productVariantId === variantId ? { ...v, price: Math.max(0, price) } : v
      )
    );
  };

  const calculateTotal = () => {
    return selectedVariants.reduce((sum, v) => sum + v.quantity * v.price, 0);
  };

  const handleSubmit = () => {
    if (!supplierId) {
      toast.error("Vui lòng chọn nhà cung cấp");
      return;
    }

    if (selectedVariants.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }

    const details: PurchaseOrderDetailRequest[] = selectedVariants.map((v) => ({
      productVariantId: v.productVariantId,
      quantity: v.quantity,
      price: v.price,
    }));

    const request: CreatePurchaseOrderRequest = {
      supplierId: supplierId,
      note: note.trim() || undefined,
      details
    };

    onSubmit(request);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <>
      <div className="space-y-8 bg-white rounded-lg border p-6">
        {/* Thông tin nhà cung cấp */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              1
            </span>
            Thông tin nhà cung cấp
          </h3>
          <div className="space-y-6 pl-10">
            <div className="relative" ref={supplierDropdownRef}>
              <Label htmlFor="supplierId" className="text-base font-medium">
                Nhà cung cấp <span className="text-red-500">*</span>
              </Label>
              
              {/* Input với dropdown */}
              <div className="mt-2 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="supplierId"
                    placeholder={isLoadingSuppliers ? "Đang tải..." : "Tìm kiếm và chọn nhà cung cấp..."}
                    value={
                      supplierId
                        ? suppliers.find((s) => s.id === supplierId)?.name || ""
                        : supplierSearchKeyword
                    }
                    onChange={(e) => {
                      setSupplierSearchKeyword(e.target.value);
                      if (supplierId) {
                        setSupplierId("");
                      }
                      setIsSupplierDropdownOpen(true);
                    }}
                    onFocus={() => setIsSupplierDropdownOpen(true)}
                    className="h-12 pl-10 pr-10"
                    disabled={isLoadingSuppliers}
                  />
                  <button
                    type="button"
                    onClick={() => setIsSupplierDropdownOpen(!isSupplierDropdownOpen)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isSupplierDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Dropdown */}
                {isSupplierDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    {isLoadingSuppliers ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Đang tải...
                      </div>
                    ) : suppliers.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-500">
                          {supplierSearchKeyword
                            ? "Không tìm thấy nhà cung cấp"
                            : "Không có nhà cung cấp"}
                        </p>
                      </div>
                    ) : (
                      <div className="py-1 max-h-80 overflow-y-auto">
                        {suppliers.map((supplier) => {
                          const isSelected = supplierId === supplier.id;
                          return (
                            <button
                              key={supplier.id}
                              type="button"
                              onClick={() => {
                                setSupplierId(supplier.id);
                                setSupplierSearchKeyword("");
                                setIsSupplierDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between gap-3 p-3 hover:bg-blue-50 transition-colors text-left ${
                                isSelected ? "bg-blue-50" : ""
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-medium text-sm line-clamp-1 ${
                                    isSelected ? "text-blue-600" : "text-gray-900"
                                  }`}
                                >
                                  {supplier.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">{supplier.phone}</span>
                                  {supplier.address && (
                                    <>
                                      <span className="text-xs text-gray-300">•</span>
                                      <span className="text-xs text-gray-500 line-clamp-1">
                                        {supplier.address}
                                      </span>
                                    </>
                                  )}
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
            </div>

            {supplierId && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">
                  Thông tin chi tiết
                </h4>
                {(() => {
                  const supplier = suppliers.find((s) => s.id === supplierId);
                  return supplier ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-medium min-w-[80px]">Tên:</span>
                        <span className="text-gray-900 font-semibold">{supplier.name}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-medium min-w-[80px]">Điện thoại:</span>
                        <span className="text-gray-700">{supplier.phone}</span>
                      </div>
                      {supplier.address && (
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 font-medium min-w-[80px]">Địa chỉ:</span>
                          <span className="text-gray-700">{supplier.address}</span>
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <div>
              <Label htmlFor="note" className="text-base font-medium">
                Ghi chú
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú về đơn nhập hàng (nếu có)"
                rows={3}
                className="mt-2 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Chọn sản phẩm */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              Chọn sản phẩm nhập {selectedProducts.length > 0 && `(${selectedProducts.length})`}
            </h3>
            <Button
              type="button"
              onClick={() => setIsProductSearchModalOpen(true)}
              className="h-10"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </div>
          
          <div className="pl-10 space-y-4">
            {selectedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Package className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-500 font-medium mb-1">Chưa có sản phẩm nào</p>
                <p className="text-sm text-gray-400">Nhấn "Thêm sản phẩm" để bắt đầu</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedProducts.map((product) => {
                  const productVariants = selectedVariants.filter(
                    (v) => product.variants.some((pv) => pv.id === v.productVariantId)
                  );
                  const isExpanded = expandedProductId === product.id;

                  return (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg bg-white overflow-hidden"
                    >
                      {/* Product Header */}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-gray-50 border-b border-gray-200">
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border-2 border-blue-300"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-gray-500">
                                {product.variants.length} biến thể có sẵn
                              </p>
                              {productVariants.length > 0 && (
                                <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded">
                                  Đã chọn {productVariants.length} biến thể
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            {isExpanded ? "Thu gọn" : "Chọn biến thể"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProduct(product.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Variant Selector */}
                      {isExpanded && product.variants.length > 0 && (
                        <div className="p-4 bg-gray-50">
                          <VariantSelector
                            product={product}
                            selectedVariantIds={productVariants.map((v) => v.productVariantId)}
                            onSelectVariant={(variantId) => handleAddVariant(product.id, variantId)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Danh sách đã chọn */}
        {selectedVariants.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              Danh sách sản phẩm đã chọn ({selectedVariants.length})
            </h3>
            <div className="pl-10 space-y-3 overflow-x-auto">
              <div className="min-w-[950px]">
                {selectedVariants.map((variant) => (
                <div
                  key={variant.productVariantId}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow"
                >
                  <img
                    src={variant.thumbnail}
                    alt={variant.productName}
                    className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                  />
                  <div className="w-80 space-y-1 flex-shrink-0">
                    <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                      {variant.productName}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      {variant.variantValues}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-mono">SKU: {variant.sku}</span>
                      <span>•</span>
                      <span>Tồn kho: <span className="font-semibold text-gray-700">{variant.currentStock}</span></span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-shrink-0">
                    <div className="w-24">
                      <Label className="text-xs text-gray-600 mb-1.5 block whitespace-nowrap">Số lượng</Label>
                      <Input
                        type="number"
                        min="1"
                        value={variant.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            variant.productVariantId,
                            Number(e.target.value)
                          )
                        }
                        className="h-10 text-center text-sm font-medium"
                      />
                    </div>
                    <div className="w-36">
                      <Label className="text-xs text-gray-600 mb-1.5 block whitespace-nowrap">Đơn giá</Label>
                      <Input
                        type="number"
                        min="0"
                        value={variant.price}
                        onChange={(e) =>
                          handlePriceChange(
                            variant.productVariantId,
                            Number(e.target.value)
                          )
                        }
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="w-40">
                      <Label className="text-xs text-gray-600 mb-1.5 block whitespace-nowrap">Thành tiền</Label>
                      <div className="h-10 flex items-center justify-end px-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="font-bold text-green-600 text-sm">
                          {formatPrice(variant.quantity * variant.price)}
                        </p>
                      </div>
                    </div>
                    <div className="pt-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveVariant(variant.productVariantId)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10 w-10 p-0 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>

            <div className="pl-10 flex justify-end">
              <div className="w-80 p-5 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-700">Tổng tiền:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 bg-white rounded-lg border p-6">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
          className="h-11 px-6"
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !supplierId || selectedVariants.length === 0}
          className="bg-blue-600 hover:bg-blue-700 h-11 px-8"
        >
          {isLoading ? "Đang tạo..." : submitButtonText}
        </Button>
      </div>

      {/* Product Search Modal */}
      <ProductSearchModal
        open={isProductSearchModalOpen}
        onOpenChange={setIsProductSearchModalOpen}
        onSelectProduct={handleProductSelect}
      />
    </>
  );
}
