import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@/hooks";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product.type";
import type { CreatePurchaseOrderRequest, PurchaseOrderDetailRequest } from "@/types/purchase-order.type";

// Fake suppliers data
const FAKE_SUPPLIERS = [
  { id: "1", name: "Công ty TNHH ABC", phone: "0901234567", address: "123 Nguyễn Huệ, Q1, TP.HCM" },
  { id: "2", name: "Công ty CP XYZ", phone: "0912345678", address: "456 Lê Lợi, Q1, TP.HCM" },
  { id: "3", name: "Nhà phân phối DEF", phone: "0923456789", address: "789 Trần Hưng Đạo, Q5, TP.HCM" },
  { id: "4", name: "Công ty TNHH GHI", phone: "0934567890", address: "321 Võ Văn Tần, Q3, TP.HCM" },
  { id: "5", name: "Tập đoàn JKL", phone: "0945678901", address: "654 Hai Bà Trưng, Q1, TP.HCM" },
];

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePurchaseOrderRequest) => void;
  isSubmitting: boolean;
}

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

export default function CreatePurchaseOrderDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreatePurchaseOrderDialogProps) {
  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const { data: productsData, isLoading: isLoadingProducts } = useQuery(
    () => productService.getProducts(1, 100, { keyword: searchKeyword, status: true }),
    {
      queryKey: ["products-for-purchase", searchKeyword],
      enabled: searchKeyword.length > 0,
    }
  );

  const products = productsData?.data?.data || [];

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === Number(productId));
    setSelectedProduct(product || null);
  };

  const handleAddVariant = (variantId: number) => {
    if (!selectedProduct) return;

    const variant = selectedProduct.variants.find((v) => v.id === variantId);
    if (!variant) return;

    // Check if already added
    if (selectedVariants.some((v) => v.productVariantId === variantId)) {
      toast.error("Biến thể này đã được thêm");
      return;
    }

    const variantValues = variant.productVariantValues
      .map((pvv) => pvv.variantValue.value)
      .join(", ");

    const newVariant: SelectedVariant = {
      productVariantId: variant.id,
      productName: selectedProduct.name,
      sku: variant.sku,
      thumbnail: selectedProduct.thumbnail,
      variantValues,
      currentStock: variant.stock,
      quantity: 1,
      price: variant.price,
    };

    setSelectedVariants([...selectedVariants, newVariant]);
  };

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
      details,
    };

    onSubmit(request);
  };

  const handleClose = () => {
    setSupplierId("");
    setNote("");
    setSelectedProduct(null);
    setSelectedVariants([]);
    setSearchKeyword("");
    onOpenChange(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Tạo phiếu nhập hàng mới
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Chọn nhà cung cấp và sản phẩm cần nhập vào kho
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-8">
          {/* Thông tin nhà cung cấp */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              Thông tin nhà cung cấp
            </h3>
            <div className="grid grid-cols-1 gap-6 pl-10">
              <div className="col-span-1">
                <Label htmlFor="supplierId" className="text-base">
                  Nhà cung cấp <span className="text-red-500">*</span>
                </Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Chọn nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAKE_SUPPLIERS.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id} className="py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-base">{supplier.name}</span>
                          <span className="text-xs text-gray-500">
                            📞 {supplier.phone} • 📍 {supplier.address}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Label htmlFor="note" className="text-base">Ghi chú</Label>
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
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              Chọn sản phẩm nhập
            </h3>
            
            <div className="pl-10 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="🔍 Tìm kiếm sản phẩm theo tên..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              {searchKeyword && (
                <div className="space-y-3">
                  <Label className="text-base">Chọn sản phẩm</Label>
                  <Select onValueChange={handleProductSelect}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Chọn sản phẩm từ kết quả tìm kiếm" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingProducts ? (
                        <SelectItem value="__loading__" disabled>
                          Đang tải...
                        </SelectItem>
                      ) : products.length === 0 ? (
                        <SelectItem value="__empty__" disabled>
                          Không tìm thấy sản phẩm
                        </SelectItem>
                      ) : (
                        products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()} className="py-2">
                            {product.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedProduct && selectedProduct.variants.length > 0 && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Label className="text-base font-semibold">Chọn biến thể của "{selectedProduct.name}"</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProduct.variants.map((variant) => {
                      const variantValues = variant.productVariantValues
                        .map((pvv) => pvv.variantValue.value)
                        .join(", ");
                      const isAdded = selectedVariants.some(
                        (v) => v.productVariantId === variant.id
                      );

                      return (
                        <Button
                          key={variant.id}
                          variant={isAdded ? "secondary" : "outline"}
                          className="justify-start h-auto py-3 px-4"
                          onClick={() => handleAddVariant(variant.id)}
                          disabled={isAdded}
                        >
                          <div className="text-left w-full">
                            <p className="font-medium text-sm">{variantValues}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              SKU: {variant.sku} • Tồn kho: {variant.stock}
                            </p>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
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
                <div className="w-92 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">Tổng tiền:&nbsp;</span>
                    <span className="text-3xl font-bold text-green-600">
                      {formatPrice(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-6 border-t gap-3">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isSubmitting}
            className="h-11 px-6"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !supplierId || selectedVariants.length === 0}
            className="bg-blue-600 hover:bg-blue-700 h-11 px-8"
          >
            {isSubmitting ? "Đang tạo..." : "Tạo phiếu nhập"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}