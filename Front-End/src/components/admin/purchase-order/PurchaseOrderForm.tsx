import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce, useQuery } from "@/hooks";
import { productService } from "@/services/product.service"; // Import product service
import { supplierService } from "@/services/supplier.service";
import type { Product } from "@/types/product.type";
import type {
  CreatePurchaseOrderRequest,
  PurchaseOrderDetailRequest,
} from "@/types/purchase-order.type";
import type { SupplierListResponse } from "@/types/supplier.type";
import {
  Check,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import XLSX from "xlsx-js-style";
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
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>(
    []
  );
  const [supplierSearchKeyword, setSupplierSearchKeyword] = useState("");
  const [isProductSearchModalOpen, setIsProductSearchModalOpen] =
    useState(false);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(
    null
  );
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);

  // State mới cho việc xử lý Excel
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // // Lấy danh sách suppliers
  // const { data: suppliersData, isLoading: isLoadingSuppliers } =
  //   useQuery<SupplierListResponse>(
  //     () =>
  //       supplierService.getSuppliers({
  //         page: 1,
  //         size: 100,
  //         status: "true",
  //         name: debouncedSupplierSearch || undefined,
  //       }),
  //     {
  //       queryKey: ["suppliers-for-purchase", debouncedSupplierSearch],
  //     }
  //   );

  // const suppliers = suppliersData?.data?.data || [];

  const isPhoneNumber = /^[0-9]+$/.test(debouncedSupplierSearch.trim());
  const { data: suppliersData, isLoading: isLoadingSuppliers } =
    useQuery<SupplierListResponse>(
      () =>
        supplierService.getSuppliers({
          page: 1,
          size: 100,
          status: "true",
          // Nếu nhập số -> gửi param phone. Nếu nhập chữ -> gửi param name
          name: !isPhoneNumber ? debouncedSupplierSearch : undefined,
          phone: isPhoneNumber ? debouncedSupplierSearch : undefined,
        }),
      {
        // Thêm isPhoneNumber vào queryKey để React Query biết khi nào cần cache riêng
        queryKey: ["suppliers-for-purchase", debouncedSupplierSearch],
        // Chỉ chạy query khi component đã mount (optional, giữ nguyên logic cũ của bạn cũng được)
        // keepPreviousData: true,
      }
    );
  useEffect(() => {
    if (isPhoneNumber && suppliersData?.data?.data?.length === 1) {
      const foundSupplier = suppliersData.data.data[0];
      // Kiểm tra xem số điện thoại có khớp chính xác không (đề phòng trường hợp tìm gần đúng)
      if (foundSupplier.phone === debouncedSupplierSearch.trim()) {
        setSupplierId(foundSupplier.id.toString());
        // Ẩn dropdown để giao diện gọn gàng hơn
        setIsSupplierDropdownOpen(false);
        // Toast thông báo nhẹ cho người dùng biết đã tự động chọn
        toast.success(`Đã tìm thấy: ${foundSupplier.name}`);
      }
    }
  }, [suppliersData, debouncedSupplierSearch, isPhoneNumber]);

  // Lấy danh sách suppliers

  const suppliers = suppliersData?.data?.data || [];

  // --- LOGIC XỬ LÝ EXCEL (MỚI) ---

  // 1. Tải file mẫu
  const handleDownloadTemplate = () => {
    // 1. Định nghĩa Style (Chỉ chạy được nếu dùng xlsx-js-style)
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "2E7D32" } }, // Màu xanh lá đậm
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const cellStyle = {
      alignment: { vertical: "center" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const boldStyle = { font: { bold: true } };

    // 2. Tạo dữ liệu cho phần Header (Thông tin NCC)
    // Cấu trúc: [Nhãn, Giá trị]
    const workbook = XLSX.utils.book_new();
    const wsData = [
      // Dòng 1: Tên NCC
      [
        { v: "Nhà cung cấp:", s: boldStyle },
        { v: "Công Ty TNHH Apple VN", s: cellStyle },
        "", // Cột C trống
      ],
      // Dòng 2: SĐT (Quan trọng: Code sẽ đọc ô này - B2)
      [
        { v: "Số điện thoại:", s: boldStyle },
        { v: "0912345678", s: cellStyle }, // Đây là ô B2
        "",
      ],
      // Dòng 3: Địa chỉ
      [{ v: "Địa chỉ:", s: boldStyle }, { v: "Q.1, TP.HCM", s: cellStyle }, ""],
      // Dòng 4: Dòng trống ngăn cách
      ["", "", ""],
      // Dòng 5: Header bảng sản phẩm (Có màu xanh)
      [
        { v: "STT", s: headerStyle },
        { v: "SKU", s: headerStyle },
        { v: "Quantity", s: headerStyle },
      ],
      // Dòng 6: Dữ liệu mẫu 1
      [
        { v: 1, s: cellStyle },
        { v: "IP15-PRO-128", s: cellStyle },
        { v: 10, s: cellStyle },
      ],
      // Dòng 7: Dữ liệu mẫu 2
      [
        { v: 2, s: cellStyle },
        { v: "SS-S24-ULTRA", s: cellStyle },
        { v: 5, s: cellStyle },
      ],
    ];

    // 3. Tạo Sheet từ dữ liệu
    // Lưu ý: aoa_to_sheet thông thường không nhận style object trực tiếp theo cách này
    // nên ta dùng sheet_add_aoa hoặc tạo thủ công, nhưng thư viện xlsx-js-style hỗ trợ tốt.
    const ws = XLSX.utils.aoa_to_sheet([]);

    // Gán dữ liệu vào sheet thủ công để giữ Style
    // (Cách này hơi dài nhưng đảm bảo style hoạt động chuẩn nhất)
    XLSX.utils.sheet_add_aoa(ws, wsData, { origin: "A1" });

    // 4. Chỉnh độ rộng cột
    ws["!cols"] = [
      { wch: 15 }, // Cột A (Nhãn + STT)
      { wch: 30 }, // Cột B (Giá trị + SKU)
      { wch: 15 }, // Cột C (Quantity)
    ];

    XLSX.utils.book_append_sheet(workbook, ws, "Mau_Nhap_Hang");
    XLSX.writeFile(workbook, "Mau_Nhap_Hang_Chuan.xlsx");
  };

  // 2. Xử lý file import
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingExcel(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // --- LOGIC ĐỌC FILE MỚI ---

      // 1. Đọc toàn bộ sheet dưới dạng mảng các mảng (Array of Arrays) để lấy thông tin NCC
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      }) as any[][];

      // Kiểm tra file có dữ liệu không
      if (!rawData || rawData.length === 0) {
        toast.error("File Excel trống");
        return;
      }

      // 2. Lấy SĐT từ ô B2 (Dòng index 1, Cột index 1)
      // Cấu trúc:
      // Dòng 0: [Nhà cung cấp:, Ten...]
      // Dòng 1: [Số điện thoại:, 0912...] -> Đây là cái ta cần
      let phone = "";
      if (rawData.length > 1 && rawData[1].length > 1) {
        phone = rawData[1][1]?.toString().trim() || "";
      }

      // Xử lý logic tìm nhà cung cấp
      if (phone && !supplierId) {
        if (phone.length === 9 && !phone.startsWith("0")) {
          phone = "0" + phone;
        }
        console.log("Tìm NCC với SĐT:", phone);

        // Gọi API tìm NCC (Giữ nguyên code cũ của bạn)
        const supplierRes = await supplierService.getSuppliers({
          page: 1,
          size: 10,
          status: "true",
          phone: phone,
        });
        const dataList = supplierRes.data?.data || [];
        const foundSupplier = dataList.find(
          (s: any) => s.phone.includes(phone) || phone.includes(s.phone)
        );

        if (foundSupplier) {
          setSupplierId(foundSupplier.id.toString());
          setSupplierSearchKeyword(foundSupplier.name);
          toast.success(`Đã chọn: ${foundSupplier.name}`);
        } else {
          toast.warning(`Không tìm thấy NCC có SĐT: ${phone}`);
        }
      }

      // 3. Lấy danh sách sản phẩm
      // Bảng bắt đầu từ dòng 5 (Header là STT, SKU, Quantity).
      // Trong Excel dòng 5 tương ứng index 4.
      // Dùng option { range: 4 } để bảo thư viện bỏ qua 4 dòng đầu.
      const productData = XLSX.utils.sheet_to_json(worksheet, {
        range: 4,
      }) as any[];

      const newSelectedProducts: Product[] = [...selectedProducts];
      const newSelectedVariants: SelectedVariant[] = [...selectedVariants];

      // Xử lý Products (Lặp qua productData thay vì jsonData cũ)
      const variantPromises = productData.map(async (row) => {
        // Cột bây giờ là SKU và Quantity (chữ hoa đầu, khớp với header dòng 5)
        const sku = row.SKU?.toString();
        const quantity = Number(row.Quantity) || 1;

        if (!sku) return null;

        try {
          // ... (Giữ nguyên logic gọi API tìm sản phẩm như cũ) ...
          const productRes = await productService.getProducts(1, 10, {
            keyword: sku,
            status: true,
          });
          const products = productRes.data.data;
          if (products && products.length > 0) {
            for (const product of products) {
              const variant = product.variants.find(
                (v) => v.sku.toLowerCase() === sku.toLowerCase()
              );
              if (variant) {
                return { product, variant, quantity, price: variant.price };
              }
            }
          }
          return null;
        } catch (err) {
          return null;
        }
      });

      // ... (Giữ nguyên phần Promise.all và cập nhật state như cũ) ...
      const results = await Promise.all(variantPromises);
      let successCount = 0;

      results.forEach((item) => {
        if (item) {
          const { product, variant, quantity, price } = item;
          // Logic thêm vào state y hệt cũ
          if (!newSelectedProducts.some((p) => p.id === product.id)) {
            newSelectedProducts.push(product);
          }
          const existingVariantIndex = newSelectedVariants.findIndex(
            (v) => v.productVariantId === variant.id
          );
          const variantValues = variant.productVariantValues
            .map((pvv: any) => pvv.variantValue.value)
            .join(" / ");

          if (existingVariantIndex >= 0) {
            newSelectedVariants[existingVariantIndex] = {
              ...newSelectedVariants[existingVariantIndex],
              quantity,
              price,
            };
          } else {
            newSelectedVariants.push({
              productVariantId: variant.id,
              productName: product.name,
              sku: variant.sku,
              thumbnail: product.thumbnail,
              variantValues,
              currentStock: variant.stock,
              quantity,
              price,
            });
          }
          successCount++;
        }
      });

      setSelectedProducts(newSelectedProducts);
      setSelectedVariants(newSelectedVariants);
      toast.success(`Đã import ${successCount} sản phẩm.`);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi file Excel. Hãy dùng file mẫu mới.");
    } finally {
      setIsProcessingExcel(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- KẾT THÚC LOGIC EXCEL ---

  const handleProductSelect = useCallback(
    (product: Product) => {
      if (selectedProducts.some((p) => p.id === product.id)) {
        return;
      }
      setSelectedProducts((prev) => [...prev, product]);
      setExpandedProductId(product.id);
    },
    [selectedProducts]
  );

  const handleRemoveProduct = useCallback(
    (productId: number) => {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
      setSelectedVariants((prev) => {
        const product = selectedProducts.find((p) => p.id === productId);
        if (!product) return prev;
        const variantIds = product.variants.map((v) => v.id);
        return prev.filter((v) => !variantIds.includes(v.productVariantId));
      });
      if (expandedProductId === productId) {
        setExpandedProductId(null);
      }
    },
    [selectedProducts, expandedProductId]
  );

  const handleAddVariant = useCallback(
    (productId: number, variantId: number) => {
      const product = selectedProducts.find((p) => p.id === productId);
      if (!product) return;

      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) return;

      const isAlreadySelected = selectedVariants.some(
        (v) => v.productVariantId === variantId
      );

      if (isAlreadySelected) {
        setSelectedVariants((prev) =>
          prev.filter((v) => v.productVariantId !== variantId)
        );
      } else {
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
    },
    [selectedProducts, selectedVariants]
  );

  const handleRemoveVariant = (variantId: number) => {
    setSelectedVariants(
      selectedVariants.filter((v) => v.productVariantId !== variantId)
    );
  };

  const handleQuantityChange = (variantId: number, quantity: number) => {
    setSelectedVariants(
      selectedVariants.map((v) =>
        v.productVariantId === variantId
          ? { ...v, quantity: Math.max(1, quantity) }
          : v
      )
    );
  };

  const handlePriceChange = (variantId: number, price: number) => {
    setSelectedVariants(
      selectedVariants.map((v) =>
        v.productVariantId === variantId
          ? { ...v, price: Math.max(0, price) }
          : v
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="space-y-8 bg-white rounded-lg border p-6">
        {/* Khu vực Import Excel (Đặt ở đầu hoặc gần tiêu đề) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-800">
                Nhập hàng nhanh từ Excel
              </h4>
              <p className="text-sm text-green-600">
                Tự động điền sản phẩm và nhà cung cấp
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="bg-white text-green-700 border-green-200 hover:bg-green-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Tải file mẫu
            </Button>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingExcel}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessingExcel ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isProcessingExcel ? "Đang xử lý..." : "Import Excel"}
            </Button>
          </div>
        </div>

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

              <div className="mt-2 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="supplierId"
                    placeholder={
                      isLoadingSuppliers
                        ? "Đang tải..."
                        : "Tìm kiếm và chọn nhà cung cấp..."
                    }
                    value={
                      supplierId
                        ? suppliers.find(
                            (s) => s.id.toString() === supplierId.toString()
                          )?.name || ""
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
                    onClick={() =>
                      setIsSupplierDropdownOpen(!isSupplierDropdownOpen)
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isSupplierDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

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
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {supplier.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {supplier.phone}
                                  </span>
                                  {supplier.address && (
                                    <>
                                      <span className="text-xs text-gray-300">
                                        •
                                      </span>
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
                  const supplier = suppliers.find(
                    (s) => s.id.toString() === supplierId.toString()
                  );
                  return supplier ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-medium min-w-[80px]">
                          Tên:
                        </span>
                        <span className="text-gray-900 font-semibold">
                          {supplier.name}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-medium min-w-[80px]">
                          Điện thoại:
                        </span>
                        <span className="text-gray-700">{supplier.phone}</span>
                      </div>
                      {supplier.address && (
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 font-medium min-w-[80px]">
                            Địa chỉ:
                          </span>
                          <span className="text-gray-700">
                            {supplier.address}
                          </span>
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

        {/* Chọn sản phẩm (Giữ nguyên phần này) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              Chọn sản phẩm nhập{" "}
              {selectedProducts.length > 0 && `(${selectedProducts.length})`}
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
                <p className="text-gray-500 font-medium mb-1">
                  Chưa có sản phẩm nào
                </p>
                <p className="text-sm text-gray-400">
                  Nhấn "Thêm sản phẩm" hoặc dùng "Import Excel" để bắt đầu
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedProducts.map((product) => {
                  const productVariants = selectedVariants.filter((v) =>
                    product.variants.some((pv) => pv.id === v.productVariantId)
                  );
                  const isExpanded = expandedProductId === product.id;

                  return (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg bg-white overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-gray-50 border-b border-gray-200">
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border-2 border-blue-300"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {product.name}
                            </p>
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
                            onClick={() =>
                              setExpandedProductId(
                                isExpanded ? null : product.id
                              )
                            }
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

                      {isExpanded && product.variants.length > 0 && (
                        <div className="p-4 bg-gray-50">
                          <VariantSelector
                            product={product}
                            selectedVariantIds={productVariants.map(
                              (v) => v.productVariantId
                            )}
                            onSelectVariant={(variantId) =>
                              handleAddVariant(product.id, variantId)
                            }
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

        {/* Danh sách đã chọn (Giữ nguyên) */}
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
                        <span>
                          Tồn kho:{" "}
                          <span className="font-semibold text-gray-700">
                            {variant.currentStock}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 flex-shrink-0">
                      <div className="w-24">
                        <Label className="text-xs text-gray-600 mb-1.5 block whitespace-nowrap">
                          Số lượng
                        </Label>
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
                        <Label className="text-xs text-gray-600 mb-1.5 block whitespace-nowrap">
                          Đơn giá
                        </Label>
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
                        <Label className="text-xs text-gray-600 mb-1.5 block whitespace-nowrap">
                          Thành tiền
                        </Label>
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
                          onClick={() =>
                            handleRemoveVariant(variant.productVariantId)
                          }
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
                  <span className="text-base font-semibold text-gray-700">
                    Tổng tiền:
                  </span>
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
          disabled={isLoading || isProcessingExcel}
          className="h-11 px-6"
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            isLoading ||
            isProcessingExcel ||
            !supplierId ||
            selectedVariants.length === 0
          }
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
