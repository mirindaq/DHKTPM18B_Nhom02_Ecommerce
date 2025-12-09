import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CustomBadge } from "@/components/ui/CustomBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Package, Tag, Check, MapPin } from "lucide-react";
import type { CartDetailResponse } from "@/types/cart.type";
import type { Address } from "@/types/address.type";
import type { Province } from "@/types/province.type";
import type { Ward } from "@/types/ward.type";
import { toast } from "sonner";
import { productService } from "@/services/product.service";
import { addressService } from "@/services/address.service";
import { provinceService } from "@/services/province.service";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useUser } from "@/context/UserContext";
import { authService } from "@/services/auth.service";
import { voucherService } from "@/services/voucher.service";
import { orderService } from "@/services/order.service";
import type { VoucherAvailableResponse } from "@/types/voucher.type";
import type { PaymentMethod } from "@/types/order.type";

type CheckoutStep = "info" | "payment";

interface CheckoutFormData {
  // Thông tin khách hàng
  email: string;
  subscribeEmail: boolean;

  // Phương thức nhận hàng
  isPickup: boolean;

  // Thông tin giao hàng (chỉ cho delivery)
  receiverAddress?: string;
  receiverPhone?: string;
  receiverName?: string;

  // Ghi chú
  note: string;

  // Voucher và payment
  voucherId?: number;
  paymentMethod?: string;
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const selectedItems =
    (location.state?.selectedItems as CartDetailResponse[]) || [];

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("info");
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatedItems, setUpdatedItems] = useState<CartDetailResponse[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [availableVouchers, setAvailableVouchers] = useState<
    VoucherAvailableResponse[]
  >([]);
  const [selectedVoucher, setSelectedVoucher] =
    useState<VoucherAvailableResponse | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProductListModal, setShowProductListModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Province and Ward states for new address input
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null
  );
  const [selectedWardId, setSelectedWardId] = useState<number | null>(null);
  const [isEnteringNewAddress, setIsEnteringNewAddress] = useState(false);
  const [subAddress, setSubAddress] = useState("");
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: "",
    subscribeEmail: false,
    isPickup: true,
    note: "",
    paymentMethod: "CASH",
  });

  // Lấy thông tin user profile khi component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const response = await authService.getProfile();
        const profile = response.data.data;

        setUserProfile(profile);

        // Fill thông tin email vào form
        setFormData((prev) => ({
          ...prev,
          email: profile.email || "",
        }));
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Không thể tải thông tin tài khoản");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (user) {
      fetchUserProfile();
    } else {
      setIsLoadingProfile(false);
    }
  }, [user]);

  // Lấy danh sách địa chỉ đã lưu
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        const addressList = await addressService.getAddresses();
        setAddresses(addressList);

        // Tự động chọn địa chỉ mặc định nếu có
        const defaultAddress = addressList.find(
          (addr: Address) => addr.isDefault
        );
        if (defaultAddress) {
          setFormData((prev) => ({
            ...prev,
            receiverName: defaultAddress.fullName,
            receiverPhone: defaultAddress.phone,
            receiverAddress:
              defaultAddress.fullAddress ||
              `${defaultAddress.subAddress}, ${
                defaultAddress.wardName || ""
              }, ${defaultAddress.provinceName || ""}`,
          }));
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    if (user) {
      fetchAddresses();
    }
  }, [user]);

  // Load danh sách tỉnh/thành phố
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await provinceService.getAllProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Load danh sách xã/phường khi chọn tỉnh
  useEffect(() => {
    const fetchWards = async () => {
      if (selectedProvinceId) {
        try {
          const data = await provinceService.getWardsByProvince(
            selectedProvinceId
          );
          setWards(data);
          setSelectedWardId(null); // Reset ward khi đổi province
        } catch (error) {
          console.error("Error fetching wards:", error);
        }
      } else {
        setWards([]);
        setSelectedWardId(null);
      }
    };
    fetchWards();
  }, [selectedProvinceId]);

  // Cập nhật receiverAddress khi chọn tỉnh/xã và nhập địa chỉ chi tiết
  useEffect(() => {
    if (isEnteringNewAddress && selectedWardId && subAddress) {
      const selectedProvince = provinces.find(
        (p) => p.id === selectedProvinceId
      );
      const selectedWard = wards.find((w) => w.id === selectedWardId);

      if (selectedProvince && selectedWard) {
        const fullAddress = `${subAddress}, ${selectedWard.name}, ${selectedProvince.name}`;
        setFormData((prev) => ({
          ...prev,
          receiverAddress: fullAddress,
        }));
      }
    }
  }, [
    isEnteringNewAddress,
    selectedProvinceId,
    selectedWardId,
    subAddress,
    provinces,
    wards,
  ]);

  // Lấy promotion mới nhất khi component mount
  useEffect(() => {
    const fetchLatestPromotions = async () => {
      if (selectedItems.length === 0) {
        setIsLoadingPromotions(false);
        return;
      }

      try {
        setIsLoadingPromotions(true);

        // Lấy danh sách productVariantIds
        const productVariantIds = selectedItems.map(
          (item) => item.productVariantId
        );

        // Gọi API lấy promotion mới nhất
        const promotions = await productService.getProductsVariantPromotions({
          productVariantIds,
        });

        // Map lại discount mới cho từng item
        const itemsWithLatestPromotions = selectedItems.map((item) => {
          const promotion = promotions.data.find(
            (p) => p.productVariantId === item.productVariantId
          );

          return {
            ...item,
            discount: promotion?.discount ?? 0, // Sử dụng discount mới hoặc 0 nếu không có promotion
          };
        });

        setUpdatedItems(itemsWithLatestPromotions);
      } catch (error) {
        console.error("Error fetching promotions:", error);
        toast.error("Không thể tải thông tin khuyến mãi");
        // Nếu lỗi, vẫn dùng items gốc
        setUpdatedItems(selectedItems);
      } finally {
        setIsLoadingPromotions(false);
      }
    };

    fetchLatestPromotions();
  }, []);

  // Lấy danh sách vouchers available
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setIsLoadingVouchers(true);
        const vouchers = await voucherService.getAvailableVouchers();

        console.log("Vouchers from service:", vouchers); // Debug log

        setAvailableVouchers(Array.isArray(vouchers) ? vouchers : []);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        setAvailableVouchers([]); // Set empty array on error
      } finally {
        setIsLoadingVouchers(false);
      }
    };

    fetchVouchers();
  }, []);

  // Sử dụng updatedItems thay vì selectedItems cho tính toán
  const itemsToDisplay = updatedItems.length > 0 ? updatedItems : selectedItems;

  // Tính toán tổng tiền
  const calculateSubtotal = () => {
    return itemsToDisplay.reduce((total, item) => {
      const discountedPrice = item.price * (1 - item.discount / 100);
      return total + discountedPrice * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = !formData.isPickup ? 0 : 0; // Miễn phí

  // Tính discount theo thứ tự: promotion (đã tính trong subtotal) -> rank -> voucher
  const rankDiscount = userProfile?.rank?.discountRate || 0;
  const rankDiscountAmount = subtotal * (rankDiscount / 100);

  // Tính subtotal sau khi trừ rank để check điều kiện voucher
  const subtotalAfterRank = subtotal - rankDiscountAmount;

  // Tính discount từ voucher (sau khi đã trừ rank)
  // Voucher minOrderAmount sẽ được check với subtotalAfterRank
  let voucherDiscountAmount = 0;

  if (selectedVoucher && subtotalAfterRank >= selectedVoucher.minOrderAmount) {
    // Tính discount theo % của voucher
    const calculatedDiscount =
      subtotalAfterRank * (selectedVoucher.discount / 100);
    // Nếu vượt max thì lấy max
    voucherDiscountAmount = Math.min(
      calculatedDiscount,
      selectedVoucher.maxDiscountAmount
    );
  }

  const total =
    subtotal + shippingFee - rankDiscountAmount - voucherDiscountAmount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleInputChange = (field: keyof CheckoutFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle chọn địa chỉ từ danh sách đã lưu
  const handleAddressSelect = (address: Address) => {
    const fullAddress =
      address.fullAddress ||
      `${address.subAddress}, ${address.wardName || ""}, ${
        address.provinceName || ""
      }`;

    setFormData((prev) => ({
      ...prev,
      receiverName: address.fullName,
      receiverPhone: address.phone,
      receiverAddress: fullAddress,
    }));
    setShowAddressModal(false);
    setIsEnteringNewAddress(false);
    setSelectedProvinceId(null);
    setSelectedWardId(null);
    setSubAddress("");
  };

  const handleDeliveryMethodChange = (isPickup: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isPickup,
      // Reset delivery fields when switching to pickup
      ...(isPickup
        ? {
            selectedAddressId: undefined,
            receiverAddress: "",
            receiverPhone: "",
            receiverName: "",
          }
        : {}),
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error("Vui lòng nhập email");
      return false;
    }

    if (!formData.isPickup) {
      if (!formData.receiverName?.trim()) {
        toast.error("Vui lòng nhập tên người nhận");
        return false;
      }
      if (!formData.receiverPhone?.trim()) {
        toast.error("Vui lòng nhập số điện thoại người nhận");
        return false;
      }
      if (!formData.receiverAddress?.trim()) {
        toast.error("Vui lòng nhập địa chỉ giao hàng");
        return false;
      }
    }

    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateForm()) return;
    setCurrentStep("payment");
  };

  const handleSubmit = async () => {
    // Validate payment method
    if (!formData.paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    try {
      setIsSubmitting(true);

      // Map payment method to backend enum
      let paymentMethod: PaymentMethod = "CASH_ON_DELIVERY";
      if (formData.paymentMethod === "VNPAY") {
        paymentMethod = "VN_PAY";
      } else if (formData.paymentMethod === "PAYOS") {
        paymentMethod = "PAY_OS";
      }

      // Chuẩn bị data gửi lên backend theo OrderCreationRequest
      const orderData = {
        receiverAddress: formData.receiverAddress || "",
        receiverName: formData.receiverName || userProfile?.fullName || "",
        receiverPhone: formData.receiverPhone || userProfile?.phone || "",
        note: formData.note || "",
        subscribeEmail: formData.subscribeEmail,
        email: formData.email,
        isPickup: formData.isPickup,
        voucherId: selectedVoucher?.id || null,
        paymentMethod: paymentMethod,
        cartItemIds: selectedItems.map((item) => item.id),
      };

      console.log("Order data to send:", orderData);

      // Gọi API để tạo đơn hàng
      const response = await orderService.createOrder(orderData);

      console.log("Order response:", response);

      // Kiểm tra nếu response.data là string (payment URL)
      if (response.data && typeof response.data === "string") {
        // Đây là URL thanh toán (VNPAY hoặc PAYOS)
        toast.success("Đang chuyển đến trang thanh toán...");
        // Mở link thanh toán trong tab mới hoặc redirect
        window.location.href = response.data;
      } else {
        // Đơn hàng đã được tạo thành công (COD)
        toast.success("Đặt hàng thành công!");

        // Navigate về trang chủ
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Không thể tạo đơn hàng. Vui lòng thử lại!";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            Không có sản phẩm nào
          </h2>
          <p className="text-gray-500 mb-6">
            Vui lòng chọn sản phẩm từ giỏ hàng
          </p>
          <Button onClick={() => navigate("/cart")}>Quay lại giỏ hàng</Button>
        </div>
      </div>
    );
  }

  if (isLoadingPromotions || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/cart")} size="sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">
              {currentStep === "info" ? "Thông tin" : "Thanh toán"}
            </h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Tab Navigation */}
        <div className="flex mb-6 bg-white">
          <button
            onClick={() => setCurrentStep("info")}
            className={`flex-1 py-4 text-center font-semibold border-b-2 transition-colors ${
              currentStep === "info"
                ? "text-red-600 border-red-600"
                : "text-gray-400 border-gray-200"
            }`}
          >
            1. THÔNG TIN
          </button>
          <button
            onClick={() => {
              if (validateForm()) {
                setCurrentStep("payment");
              }
            }}
            className={`flex-1 py-4 text-center font-semibold border-b-2 transition-colors ${
              currentStep === "payment"
                ? "text-red-600 border-red-600"
                : "text-gray-400 border-gray-200"
            }`}
          >
            2. THANH TOÁN
          </button>
        </div>

        {/* Step 1: Information */}
        {currentStep === "info" && (
          <div className="space-y-4">
            {/* Product Summary */}
            <div className="bg-white rounded-lg border p-4">
              {itemsToDisplay.map((item, index) => (
                <div
                  key={item.productVariantId}
                  className={`flex items-start gap-3 ${
                    index < itemsToDisplay.length - 1
                      ? "pb-4 mb-4 border-b"
                      : ""
                  }`}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden shrink-0">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm line-clamp-2 mb-1">
                      {item.productName}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-red-600 font-semibold">
                          {formatPrice(item.price * (1 - item.discount / 100))}
                        </span>
                        {item.discount > 0 && (
                          <span className="ml-2 text-gray-400 line-through text-xs">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Số lượng: {item.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-base font-semibold mb-4 text-gray-700">
                THÔNG TIN KHÁCH HÀNG
              </h2>

              <div className="space-y-3">
                {/* Hiển thị tên và số điện thoại */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-base">
                        {userProfile?.fullName || "Khách hàng"}
                      </span>
                      {userProfile?.rank && (
                        <CustomBadge
                          variant="warning"
                          size="sm"
                          className="font-medium"
                        >
                          {userProfile.rank.name}
                        </CustomBadge>
                      )}
                    </div>
                    {userProfile?.phone && (
                      <span className="text-sm text-gray-600">
                        {userProfile.phone}
                      </span>
                    )}
                  </div>

                  {/* Email input */}
                  <div className="mt-3">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-medium text-gray-500 text-xs">
                        EMAIL
                      </span>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="subscribeEmail"
                    checked={formData.subscribeEmail}
                    onChange={(e) =>
                      handleInputChange("subscribeEmail", e.target.checked)
                    }
                    className="mt-1 rounded border-gray-300"
                  />
                  <Label
                    htmlFor="subscribeEmail"
                    className="cursor-pointer font-normal text-sm"
                  >
                    Nhận email thông báo và ưu đãi từ EcomStore
                  </Label>
                </div>

                <p className="text-xs text-gray-500 italic">
                  (*) Hóa đơn VAT sẽ được gửi qua email này
                </p>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-base font-semibold mb-4 text-gray-700">
                THÔNG TIN NHẬN HÀNG
              </h2>

              <RadioGroup
                value={formData.isPickup ? "pickup" : "delivery"}
                onValueChange={(value) =>
                  handleDeliveryMethodChange(value === "pickup")
                }
                className="grid grid-cols-2 gap-3 mb-4"
              >
                <div
                  className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer ${
                    formData.isPickup
                      ? "border-red-600 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="cursor-pointer text-sm">
                    Nhận tại cửa hàng
                  </Label>
                </div>

                <div
                  className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer ${
                    !formData.isPickup
                      ? "border-red-600 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="cursor-pointer text-sm">
                    Giao hàng tận nơi
                  </Label>
                </div>
              </RadioGroup>

              {formData.isPickup ? (
                <div>
                  <Label htmlFor="pickupNote" className="text-sm">
                    Ghi chú (nếu có)
                  </Label>
                  <Textarea
                    id="pickupNote"
                    placeholder="Nhập ghi chú..."
                    value={formData.note}
                    onChange={(e) => handleInputChange("note", e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Danh sách địa chỉ đã lưu */}
                  {isLoadingAddresses ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      <span className="ml-2 text-sm text-gray-500">
                        Đang tải địa chỉ...
                      </span>
                    </div>
                  ) : (
                    addresses.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-600" />
                            Địa chỉ đã lưu
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 hover:text-blue-700"
                            onClick={() =>
                              setShowAddressModal(!showAddressModal)
                            }
                          >
                            {showAddressModal
                              ? "Ẩn bớt"
                              : `Xem tất cả (${addresses.length})`}
                          </Button>
                        </div>

                        {/* Hiển thị địa chỉ được chọn hoặc danh sách */}
                        <div
                          className={`space-y-2 ${
                            showAddressModal
                              ? "max-h-[250px] overflow-y-auto"
                              : ""
                          }`}
                        >
                          {(showAddressModal
                            ? addresses
                            : addresses
                                .filter(
                                  (addr) =>
                                    addr.fullAddress ===
                                      formData.receiverAddress ||
                                    (addr.isDefault &&
                                      !formData.receiverAddress)
                                )
                                .slice(0, 1)
                          ).map((address) => {
                            const isSelected =
                              address.fullAddress ===
                                formData.receiverAddress ||
                              (address.isDefault && !formData.receiverAddress);

                            return (
                              <div
                                key={address.id}
                                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-200 hover:border-red-300 hover:bg-red-50/30"
                                }`}
                                onClick={() => handleAddressSelect(address)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-sm text-gray-900">
                                        {address.fullName}
                                      </span>
                                      <span className="text-gray-400">|</span>
                                      <span className="text-sm text-gray-600">
                                        {address.phone}
                                      </span>
                                      {address.isDefault && (
                                        <CustomBadge
                                          variant="error"
                                          size="sm"
                                        >
                                          Mặc định
                                        </CustomBadge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {address.fullAddress}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <div className="flex-shrink-0">
                                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                        <svg
                                          className="w-3 h-3 text-white"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Nút nhập địa chỉ mới */}
                        <div
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            isEnteringNewAddress
                              ? "border-blue-500 bg-blue-50"
                              : "border-dashed border-gray-300 hover:border-blue-300 hover:bg-blue-50/30"
                          }`}
                          onClick={() => {
                            // Clear để chuyển sang nhập thủ công
                            handleInputChange("receiverName", "");
                            handleInputChange("receiverPhone", "");
                            handleInputChange("receiverAddress", "");
                            setSelectedProvinceId(null);
                            setSelectedWardId(null);
                            setSubAddress("");
                            setIsEnteringNewAddress(true);
                            setShowAddressModal(false);
                          }}
                        >
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            <span className="text-sm font-medium">
                              Nhập địa chỉ mới
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {/* Form nhập thông tin giao hàng */}
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div>
                      <Label htmlFor="receiverName" className="text-sm">
                        Tên người nhận <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="receiverName"
                        placeholder="Nhập tên người nhận"
                        value={formData.receiverName || ""}
                        onChange={(e) =>
                          handleInputChange("receiverName", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="receiverPhone" className="text-sm">
                        Số điện thoại <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="receiverPhone"
                        placeholder="Nhập số điện thoại"
                        value={formData.receiverPhone || ""}
                        onChange={(e) =>
                          handleInputChange("receiverPhone", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>

                    {/* Nếu đang nhập địa chỉ mới, hiển thị select tỉnh/xã */}
                    {isEnteringNewAddress ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm">
                              Tỉnh/Thành phố{" "}
                              <span className="text-red-600">*</span>
                            </Label>
                            <Select
                              value={selectedProvinceId?.toString() || ""}
                              onValueChange={(value) =>
                                setSelectedProvinceId(Number(value))
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Chọn tỉnh/thành phố" />
                              </SelectTrigger>
                              <SelectContent>
                                {provinces.map((province) => (
                                  <SelectItem
                                    key={province.id}
                                    value={province.id.toString()}
                                  >
                                    {province.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm">
                              Quận/Huyện/Xã{" "}
                              <span className="text-red-600">*</span>
                            </Label>
                            <Select
                              value={selectedWardId?.toString() || ""}
                              onValueChange={(value) =>
                                setSelectedWardId(Number(value))
                              }
                              disabled={!selectedProvinceId}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue
                                  placeholder={
                                    selectedProvinceId
                                      ? "Chọn quận/huyện/xã"
                                      : "Chọn tỉnh trước"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {wards.map((ward) => (
                                  <SelectItem
                                    key={ward.id}
                                    value={ward.id.toString()}
                                  >
                                    {ward.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="subAddress" className="text-sm">
                            Địa chỉ chi tiết{" "}
                            <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            id="subAddress"
                            placeholder="Số nhà, tên đường..."
                            value={subAddress}
                            onChange={(e) => setSubAddress(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        {/* Hiển thị địa chỉ đầy đủ (preview) */}
                        {formData.receiverAddress && (
                          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">
                              Địa chỉ đầy đủ:
                            </p>
                            <p className="text-sm text-gray-700">
                              {formData.receiverAddress}
                            </p>
                          </div>
                        )}

                        {/* Nút quay lại chọn từ danh sách */}
                        {addresses.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              setIsEnteringNewAddress(false);
                              // Chọn lại địa chỉ mặc định
                              const defaultAddress = addresses.find(
                                (addr) => addr.isDefault
                              );
                              if (defaultAddress) {
                                handleAddressSelect(defaultAddress);
                              }
                            }}
                          >
                            ← Chọn từ địa chỉ đã lưu
                          </Button>
                        )}
                      </>
                    ) : (
                      <div>
                        <Label htmlFor="receiverAddress" className="text-sm">
                          Địa chỉ <span className="text-red-600">*</span>
                        </Label>
                        <Textarea
                          id="receiverAddress"
                          placeholder="Nhập địa chỉ chi tiết"
                          value={formData.receiverAddress || ""}
                          onChange={(e) =>
                            handleInputChange("receiverAddress", e.target.value)
                          }
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="deliveryNote" className="text-sm">
                        Ghi chú (nếu có)
                      </Label>
                      <Textarea
                        id="deliveryNote"
                        placeholder="Nhập ghi chú..."
                        value={formData.note}
                        onChange={(e) =>
                          handleInputChange("note", e.target.value)
                        }
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total and Continue Button */}
            <div className="bg-white rounded-lg border p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Tổng tiền tạm tính:</span>
                  <span className="text-xl font-bold text-red-600">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
                onClick={handleContinueToPayment}
              >
                Tiếp tục
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {currentStep === "payment" && (
          <div className="space-y-4">
            {/* Voucher Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-gray-800 uppercase tracking-wide border-b pb-3">
                <Tag className="w-5 h-5 text-red-600" />
                Chọn Voucher
              </h3>

              {isLoadingVouchers ? (
                <div className="py-12 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-3"></div>
                  <p className="text-sm font-medium">Đang tải vouchers...</p>
                </div>
              ) : availableVouchers.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <Tag className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium">
                    Không có voucher khả dụng
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {availableVouchers.map((voucher) => {
                    // Check voucher với subtotalAfterRank (sau khi trừ promotion và rank)
                    const isDisabled =
                      subtotalAfterRank < voucher.minOrderAmount;
                    const isSelected = selectedVoucher?.id === voucher.id;

                    return (
                      <div
                        key={voucher.id}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          isDisabled
                            ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                            : isSelected
                            ? "border-red-500 bg-gradient-to-r from-red-50 to-red-50/50 shadow-lg"
                            : "border-gray-200 hover:border-red-300 hover:bg-red-50/30 hover:shadow-md"
                        }`}
                        onClick={() => {
                          if (!isDisabled) {
                            if (isSelected) {
                              setSelectedVoucher(null);
                              toast.info("Đã bỏ chọn voucher");
                            } else {
                              setSelectedVoucher(voucher);
                              const discount = Math.min(
                                subtotalAfterRank * (voucher.discount / 100),
                                voucher.maxDiscountAmount
                              );
                              toast.success(
                                `Đã áp dụng voucher ${
                                  voucher.name
                                }! Giảm ${formatPrice(discount)}`
                              );
                            }
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-base text-gray-900">
                                {voucher.name}
                              </span>
                              <CustomBadge
                                variant="error"
                                size="sm"
                                className="font-bold"
                              >
                                -{voucher.discount}%
                              </CustomBadge>
                            </div>
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                              {voucher.description}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200">
                                Đơn tối thiểu:{" "}
                                <span className="font-bold">
                                  {formatPrice(voucher.minOrderAmount)}
                                </span>
                              </span>
                              <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium border border-green-200">
                                Giảm tối đa:{" "}
                                <span className="font-bold">
                                  {formatPrice(voucher.maxDiscountAmount)}
                                </span>
                              </span>
                            </div>
                            {isDisabled && (
                              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs text-red-600 font-medium">
                                  ⚠️ Cần thêm{" "}
                                  <span className="font-bold">
                                    {formatPrice(
                                      voucher.minOrderAmount - subtotalAfterRank
                                    )}
                                  </span>{" "}
                                  để áp dụng
                                </p>
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                              <Check
                                className="w-4 h-4 text-white"
                                strokeWidth={3}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-bold mb-4 text-gray-800 uppercase tracking-wide border-b pb-3">
                Chi tiết đơn hàng
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số lượng sản phẩm</span>
                  <span className="font-semibold text-gray-900">
                    {itemsToDisplay.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng tiền hàng</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(
                      itemsToDisplay.reduce(
                        (total, item) => total + item.price * item.quantity,
                        0
                      )
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>

                <Separator className="my-2" />

                {/* Hiển thị giảm giá trực tiếp (promotion) */}
                {itemsToDisplay.some((item) => item.discount > 0) && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-red-600 font-medium">
                      <Tag className="w-4 h-4" />
                      Giảm giá trực tiếp
                    </span>
                    <span className="font-semibold text-red-600">
                      -{" "}
                      {formatPrice(
                        itemsToDisplay.reduce(
                          (total, item) =>
                            total +
                            item.price * (item.discount / 100) * item.quantity,
                          0
                        )
                      )}
                    </span>
                  </div>
                )}

                {/* Hiển thị chiết khấu từ rank nếu có */}
                {userProfile?.rank && rankDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-amber-700 font-medium">
                      Chiết khấu {userProfile.rank.name}
                      <CustomBadge
                        variant="warning"
                        size="sm"
                        className="font-semibold"
                      >
                        -{rankDiscount}%
                      </CustomBadge>
                    </span>
                    <span className="font-semibold text-amber-700">
                      - {formatPrice(rankDiscountAmount)}
                    </span>
                  </div>
                )}

                {/* Hiển thị discount từ voucher nếu có */}
                {selectedVoucher && voucherDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-red-600 font-medium">
                      Voucher {selectedVoucher.name}
                      <CustomBadge
                        variant="error"
                        size="sm"
                        className="font-semibold"
                      >
                        -{selectedVoucher.discount}%
                      </CustomBadge>
                    </span>
                    <span className="font-semibold text-red-600">
                      - {formatPrice(voucherDiscountAmount)}
                    </span>
                  </div>
                )}

                <Separator className="my-3" />

                <div className="flex justify-between items-center pt-2 bg-gradient-to-r from-red-50 to-orange-50 -mx-5 px-5 py-4 rounded-lg">
                  <div>
                    <div className="font-bold text-gray-800 text-base">
                      Tổng thanh toán
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Đã bao gồm VAT
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-bold mb-4 text-gray-800 uppercase tracking-wide">
                Phương thức thanh toán
              </h2>
              <button
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-red-400 hover:bg-red-50/30 transition-all cursor-pointer group"
                onClick={() => setShowPaymentModal(true)}
              >
                <div className="flex items-center gap-4">
                  {formData.paymentMethod === "CASH" ? (
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                      <img
                        src="/assets/COS.png"
                        alt="EcomStore"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                  ) : formData.paymentMethod === "VNPAY" ? (
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                      <img
                        src="/assets/vnpay.png"
                        alt="VNPAY"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                  ) : formData.paymentMethod === "PAYOS" ? (
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                      <img
                        src="/assets/payos.svg"
                        alt="PAYOS"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-3xl">💳</span>
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-semibold text-base text-gray-800">
                      {formData.paymentMethod === "CASH"
                        ? "Thanh toán tại cửa hàng"
                        : formData.paymentMethod === "VNPAY"
                        ? "VNPAY"
                        : formData.paymentMethod === "PAYOS"
                        ? "PAYOS"
                        : "Chọn phương thức thanh toán"}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formData.paymentMethod
                        ? "Nhấn để thay đổi"
                        : "Vui lòng chọn phương thức"}
                    </div>
                  </div>
                </div>
                <span className="text-gray-400 text-2xl group-hover:text-red-600 transition-colors">
                  ›
                </span>
              </button>
            </div>

            {/* Delivery Info Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-bold mb-4 text-gray-800 uppercase tracking-wide border-b pb-3">
                Thông tin nhận hàng
              </h2>
              <div className="space-y-3 text-sm">
                {/* Khách hàng */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Khách hàng</span>
                  <div className="flex items-center gap-2 text-right">
                    <span className="font-semibold text-gray-900">
                      {userProfile?.fullName || "Khách hàng"}
                    </span>
                    {userProfile?.rank && (
                      <CustomBadge
                        variant="warning"
                        size="sm"
                        className="font-semibold"
                      >
                        {userProfile.rank.name}
                      </CustomBadge>
                    )}
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">
                    Số điện thoại
                  </span>
                  <span className="font-semibold text-gray-900">
                    {userProfile?.phone || "Chưa cập nhật"}
                  </span>
                </div>

                {/* Email */}
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Email</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[60%] truncate">
                    {formData.email}
                  </span>
                </div>

                <Separator className="my-2" />

                {/* Nhận hàng tại */}
                {formData.isPickup ? (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">
                      Nhận hàng tại
                    </span>
                    <span className="text-right max-w-[60%] font-semibold text-gray-900">
                      Cửa hàng EcomStore - 125 Trần Phú, Hải Châu, Đà Nẵng
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 font-medium">
                        Địa chỉ nhận
                      </span>
                      <span className="text-right max-w-[60%] font-semibold text-gray-900">
                        {formData.receiverAddress}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">
                        Người nhận
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formData.receiverName} - {formData.receiverPhone}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Submit Button and Product List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <span className="font-bold text-gray-800">
                  Tổng tiền tạm tính
                </span>
                <span className="text-2xl font-bold text-red-600">
                  {formatPrice(total)}
                </span>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </span>
                ) : (
                  "Xác nhận thanh toán"
                )}
              </Button>

              <button
                className="w-full text-sm text-blue-600 underline cursor-pointer hover:text-blue-800 font-medium transition-colors flex items-center justify-center gap-2"
                onClick={() => setShowProductListModal(true)}
              >
                <Package className="w-4 h-4" />
                Kiểm tra danh sách sản phẩm đang thanh toán (
                {itemsToDisplay.reduce((sum, item) => sum + item.quantity, 0)})
              </button>
            </div>
          </div>
        )}

        {/* Payment Method Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Chọn phương thức thanh toán
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Vui lòng chọn một phương thức để tiếp tục
              </p>
            </DialogHeader>
            <div className="space-y-4 py-6">
              <button
                className={`w-full flex items-center gap-5 p-5 border-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                  formData.paymentMethod === "CASH"
                    ? "border-red-500 bg-gradient-to-r from-red-50 to-red-50/50 shadow-lg shadow-red-100"
                    : "border-gray-200 hover:border-red-300 hover:shadow-md"
                }`}
                onClick={() => {
                  handleInputChange("paymentMethod", "CASH");
                  setShowPaymentModal(false);
                  toast.success("Đã chọn thanh toán tại cửa hàng");
                }}
              >
                <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shrink-0 border-2 border-gray-100 shadow-sm">
                  <img
                    src="/assets/COS.png"
                    alt="CellphoneS"
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-lg mb-1 text-gray-900">
                    Thanh toán tại cửa hàng
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Thanh toán khi nhận hàng tại cửa hàng EcomStore
                  </div>
                </div>
                {formData.paymentMethod === "CASH" && (
                  <div className="shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>

              <button
                className={`w-full flex items-center gap-5 p-5 border-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                  formData.paymentMethod === "VNPAY"
                    ? "border-red-500 bg-gradient-to-r from-red-50 to-red-50/50 shadow-lg shadow-red-100"
                    : "border-gray-200 hover:border-red-300 hover:shadow-md"
                }`}
                onClick={() => {
                  handleInputChange("paymentMethod", "VNPAY");
                  setShowPaymentModal(false);
                  toast.success("Đã chọn thanh toán qua VNPAY");
                }}
              >
                <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shrink-0 border-2 border-gray-100 shadow-sm">
                  <img
                    src="/assets/vnpay.png"
                    alt="VNPAY"
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-lg mb-1 text-gray-900">
                    VNPAY
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Thanh toán qua ví điện tử và ngân hàng
                  </div>
                </div>
                {formData.paymentMethod === "VNPAY" && (
                  <div className="shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>

              <button
                className={`w-full flex items-center gap-5 p-5 border-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                  formData.paymentMethod === "PAYOS"
                    ? "border-red-500 bg-gradient-to-r from-red-50 to-red-50/50 shadow-lg shadow-red-100"
                    : "border-gray-200 hover:border-red-300 hover:shadow-md"
                }`}
                onClick={() => {
                  handleInputChange("paymentMethod", "PAYOS");
                  setShowPaymentModal(false);
                  toast.success("Đã chọn thanh toán qua PAYOS");
                }}
              >
                <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shrink-0 border-2 border-gray-100 shadow-sm">
                  <img
                    src="/assets/payos.svg"
                    alt="PAYOS"
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-lg mb-1 text-gray-900">
                    PAYOS
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Thanh toán nhanh qua cổng PAYOS
                  </div>
                </div>
                {formData.paymentMethod === "PAYOS" && (
                  <div className="shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Product List Modal */}
        <Dialog
          open={showProductListModal}
          onOpenChange={setShowProductListModal}
        >
          <DialogContent className="sm:max-w-xl max-h-[85vh]">
            <DialogHeader className="pb-3 border-b">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Danh sách sản phẩm đang thanh toán
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                {itemsToDisplay.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                sản phẩm
              </p>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[60vh] py-4 space-y-3">
              {itemsToDisplay.map((item) => (
                <div
                  key={item.productVariantId}
                  className="flex items-center gap-4 p-3 rounded-xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold line-clamp-2 text-gray-800 mb-2">
                      {item.productName}
                    </h3>
                    <div className="flex items-center gap-3">
                      {item.discount > 0 && (
                        <CustomBadge
                          variant="error"
                          size="sm"
                          className="font-semibold"
                        >
                          -{item.discount}%
                        </CustomBadge>
                      )}
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md font-medium">
                        SL: {item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
