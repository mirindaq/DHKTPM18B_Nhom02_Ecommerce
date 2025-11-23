import React, { useEffect, useState } from "react";
import { addressService } from "@/services/address.service";
import { authService } from "@/services/auth.service";
import { provinceService } from "@/services/province.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@/hooks/useQuery";
import { useMutation } from "@/hooks/useMutation";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Star,
  Phone,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import type { Address, CreateAddressRequest } from "@/types/address.type";
import type { Province } from "@/types/province.type";
import type { Ward } from "@/types/ward.type";

export default function Address() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<CreateAddressRequest>({
    fullName: "",
    phone: "",
    subAddress: "",
    wardId: 0,
    isDefault: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<number | "">("");
  const [selectedWard, setSelectedWard] = useState<number | "">("");

  // ✅ useQuery cho fetch addresses
  const {
    data: addresses = [],
    isLoading: loading,
    refetch: refetchAddresses,
    error: addressesError,
  } = useQuery<Address[]>(() => addressService.getAddresses(), {
    queryKey: ["addresses"],
  });

  // ✅ useQuery cho fetch provinces
  const { data: provinces = [], isLoading: provincesLoading } = useQuery<
    Province[]
  >(() => provinceService.getAllProvinces(), {
    queryKey: ["provinces"],
  });

  // ✅ useQuery cho fetch wards (enabled khi có selectedProvince)
  const { data: wards = [], isLoading: wardsLoading } = useQuery<Ward[]>(
    () => provinceService.getWardsByProvince(selectedProvince as number),
    {
      queryKey: ["wards", String(selectedProvince)],
      enabled: !!selectedProvince && typeof selectedProvince === "number",
    }
  );

  // Xử lý error từ addresses query
  useEffect(() => {
    if (addressesError) {
      console.error("Lỗi khi tải địa chỉ:", addressesError);
      const error = addressesError as any;
      const errorMsg =
        error.response?.data?.message || "Không thể tải danh sách địa chỉ!";
      setErrorMessage(errorMsg);
    } else if (addresses) {
      setErrorMessage("");
    }
  }, [addressesError, addresses]);

  // ✅ Mutation cho thêm địa chỉ
  const addAddressMutation = useMutation(
    (payload: CreateAddressRequest) => addressService.addAddress(payload),
    {
      onSuccess: () => {
        setSuccessMessage("Thêm địa chỉ thành công!");
        setTimeout(() => {
          setShowModal(false);
          setEditingAddress(null);
          refetchAddresses();
        }, 1000);
      },
      onError: (error: any) => {
        handleSaveError(error);
      },
    }
  );

  // ✅ Mutation cho cập nhật địa chỉ
  const updateAddressMutation = useMutation(
    ({ id, payload }: { id: number; payload: CreateAddressRequest }) =>
      addressService.updateAddress(id, payload),
    {
      onSuccess: () => {
        setSuccessMessage("Cập nhật địa chỉ thành công!");
        setTimeout(() => {
          setShowModal(false);
          setEditingAddress(null);
          refetchAddresses();
        }, 1000);
      },
      onError: (error: any) => {
        handleSaveError(error);
      },
    }
  );

  // ✅ Mutation cho xóa địa chỉ
  const deleteAddressMutation = useMutation(
    (id: number) => addressService.deleteAddress(id),
    {
      onSuccess: () => {
        setSuccessMessage("Đã xóa địa chỉ!");
        refetchAddresses();
      },
      onError: (error: any) => {
        console.error("Lỗi khi xóa địa chỉ:", error);
        const errorMsg =
          error.response?.data?.message || "Không thể xóa địa chỉ!";
        setErrorMessage(errorMsg);
      },
    }
  );

  // ✅ Mutation cho đặt địa chỉ mặc định
  const setDefaultMutation = useMutation(
    (id: number) => addressService.setDefaultAddress(id),
    {
      onSuccess: () => {
        setSuccessMessage("Đã đặt địa chỉ mặc định!");
        refetchAddresses();
      },
      onError: (error: any) => {
        console.error("Lỗi khi đặt mặc định:", error);
        const errorMsg =
          error.response?.data?.message || "Không thể đặt mặc định!";
        setErrorMessage(errorMsg);
      },
    }
  );

  // ➕ Mở modal thêm/sửa
  const openModal = async (address?: Address) => {
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");

    if (address) {
      setEditingAddress(address);
      setFormData({
        fullName: address.fullName,
        phone: address.phone,
        subAddress: address.subAddress,
        wardId: address.wardId,
        isDefault: address.isDefault,
      });

      // ✅ Lấy wardId từ address
      const wardId = address.ward?.id || address.wardId;

      if (wardId) {
        // Tìm ward trong tất cả wards để lấy provinceId
        try {
          const allWards = await provinceService.getAllWards();
          const currentWard = allWards.find((w: Ward) => w.id === wardId);

          if (currentWard) {
            setSelectedProvince(currentWard.provinceId);
            // Đợi wards load xong rồi mới set selectedWard
            setTimeout(() => setSelectedWard(wardId), 150);
          }
        } catch (err) {
          console.error("Không thể tải thông tin ward:", err);
        }
      } else {
        setSelectedProvince("");
        setSelectedWard("");
      }
    } else {
      // Thêm mới - auto-fill fullName từ profile
      setEditingAddress(null);
      try {
        const res = await authService.getProfile();
        const userProfile = res.data?.data;
        setFormData({
          fullName: userProfile?.fullName || "",
          phone: "",
          subAddress: "",
          wardId: 0,
          isDefault: false,
        });
      } catch (error) {
        console.error("Lỗi khi lấy profile:", error);
        setFormData({
          fullName: "",
          phone: "",
          subAddress: "",
          wardId: 0,
          isDefault: false,
        });
      }
      setSelectedProvince("");
      setSelectedWard("");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAddress(null);
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Xử lý lỗi khi lưu
  const handleSaveError = (error: any) => {
    console.error("Lỗi khi lưu địa chỉ - full error:", error);
    console.error("Error response:", error.response);
    console.error("Error response data:", error.response?.data);

    const responseData = error.response?.data;
    const message =
      responseData?.message ||
      error.response?.statusText ||
      error.message ||
      "Không thể lưu địa chỉ!";

    setErrorMessage(message);

    if (responseData?.errors && typeof responseData.errors === "object") {
      console.log("Backend returned structured errors:", responseData.errors);
      setErrors(responseData.errors);
    } else if (typeof message === "string" && message.length > 0) {
      console.log("Backend validation message:", message);
      const fieldErrors = parseBackendErrors(message);
      console.log("Parsed field errors:", fieldErrors);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      }
    }
  };

  // 💾 Lưu địa chỉ (thêm hoặc cập nhật)
  const handleSave = async () => {
    setErrors({});
    setErrorMessage("");
    setSuccessMessage("");

    // Validation
    if (!selectedProvince) {
      setErrors({ provinceId: "Vui lòng chọn tỉnh/thành phố" });
      setErrorMessage("Vui lòng chọn tỉnh/thành phố");
      return;
    }

    if (!selectedWard) {
      setErrors({ wardId: "Vui lòng chọn quận/xã" });
      setErrorMessage("Vui lòng chọn quận/xã");
      return;
    }

    const payload: CreateAddressRequest = {
      ...formData,
      wardId: selectedWard as number,
    };

    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, payload });
    } else {
      addAddressMutation.mutate(payload);
    }
  };

  const parseBackendErrors = (errorMessage: string): Record<string, string> => {
    const fieldErrors: Record<string, string> = {};
    const errorParts = errorMessage.split(",").map((msg) => msg.trim());

    errorParts.forEach((error) => {
      const e = error.toLowerCase();
      if (
        e.includes("sub address is required") ||
        e.includes("subaddress") ||
        e.includes("sub address")
      ) {
        fieldErrors.subAddress = "Vui lòng nhập địa chỉ cụ thể";
      } else if (
        e.includes("phone number must be valid") ||
        e.includes("phone") ||
        e.includes("số điện thoại")
      ) {
        fieldErrors.phone =
          "Số điện thoại phải ở định dạng Việt Nam (0xxxxxxxxx hoặc +84xxxxxxxxx)";
      } else if (
        e.includes("fullname") ||
        e.includes("full name") ||
        e.includes("họ và tên")
      ) {
        fieldErrors.fullName = "Vui lòng nhập họ và tên";
      } else if (e.includes("ward") || e.includes("quận") || e.includes("xã")) {
        fieldErrors.wardId = "Vui lòng chọn quận/xã";
      }
    });

    return fieldErrors;
  };

  // ❌ Xóa địa chỉ
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    deleteAddressMutation.mutate(id);
  };

  // 🌟 Đặt mặc định
  const handleSetDefault = async (id: number) => {
    setDefaultMutation.mutate(id);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Địa chỉ nhận hàng</h1>
        <p className="text-gray-600">
          Quản lý địa chỉ giao hàng của bạn ({addresses.length} địa chỉ)
        </p>
      </div>

      {/* Thông báo lỗi chung */}
      {errorMessage && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertTitle>Có lỗi xảy ra</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Thông báo thành công */}
      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle>Thành công</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Header với nút thêm */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            <span className="font-medium text-gray-900">
              Danh sách địa chỉ
            </span>
          </div>
          <Button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2"
          >
            <span>Thêm địa chỉ mới</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-4" />
              <p className="text-gray-600">Đang tải danh sách địa chỉ...</p>
            </div>
          </CardContent>
        </Card>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có địa chỉ nào
              </h3>
              <p className="text-gray-600 mb-6">
                Thêm địa chỉ giao hàng đầu tiên của bạn để bắt đầu mua sắm
              </p>
              <Button onClick={() => openModal()} className="inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Thêm địa chỉ mới</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`transition-all duration-300 hover:shadow-lg ${
                address.isDefault
                  ? "ring-2 ring-green-500 border-green-200 bg-green-50/30"
                  : "hover:border-gray-300"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {address.fullName}
                      </h3>
                      {address.isDefault && (
                        <Badge className="bg-green-600 text-white">
                          <Star className="w-3 h-3 mr-1 fill-white" />
                          Mặc định
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 shrink-0" />
                        <span>{address.phone}</span>
                      </div>

                      <div className="flex items-start gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{address.subAddress}</p>
                          {address.fullAddress && (
                            <p className="text-sm text-gray-500 mt-1">
                              {address.fullAddress.replace(/\b[Pp]hường\s*/g, "")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4 shrink-0">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        className="inline-flex items-center gap-2"
                        title="Đặt làm địa chỉ mặc định"
                      >
                        <Star className="w-4 h-4" />
                        <span className="hidden sm:inline">Mặc định</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(address)}
                      className="inline-flex items-center gap-2"
                      title="Chỉnh sửa địa chỉ"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Sửa</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Xóa địa chỉ"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Xóa</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal thêm/sửa địa chỉ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {editingAddress ? (
                  <>
                    <Edit className="w-5 h-5" />
                    Chỉnh sửa địa chỉ
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Thêm địa chỉ mới
                  </>
                )}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="h-8 w-8 p-0"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6">

              {/* Lỗi validation trong modal */}
              {Object.keys(errors).length > 0 && (
                <Alert className="mb-4 bg-red-50 border-red-200">
                  <AlertTitle className="text-red-800">Lỗi xác thực</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field} className="text-red-700 text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                      errors.fullName
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                    }`}
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="VD: 0912345678"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                      errors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                    }`}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Province select */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Tỉnh / Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                      disabled={provincesLoading}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                      provincesLoading
                        ? "bg-gray-100 cursor-not-allowed text-gray-500"
                        : errors.provinceId
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                    }`}
                    value={selectedProvince}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedProvince(id || "");
                      setSelectedWard("");
                      setErrors((prev) => {
                        const cp = { ...prev };
                        delete cp.provinceId;
                        delete cp.wardId;
                        return cp;
                      });
                    }}
                  >
                    <option value="">
                      {provincesLoading
                        ? "Đang tải..."
                        : "-- Chọn tỉnh / thành phố --"}
                    </option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {errors.provinceId && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.provinceId}
                    </p>
                  )}
                </div>

                {/* Ward select */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Quận / Xã <span className="text-red-500">*</span>
                  </label>
                  <select
                    disabled={!selectedProvince || wardsLoading}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                      !selectedProvince || wardsLoading
                        ? "bg-gray-100 cursor-not-allowed text-gray-500"
                        : errors.wardId
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                    }`}
                    value={selectedWard}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedWard(id || "");
                      setErrors((prev) => {
                        const cp = { ...prev };
                        delete cp.wardId;
                        return cp;
                      });
                    }}
                  >
                    <option value="">
                      {wardsLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang tải...
                        </span>
                      ) : (
                        "-- Chọn quận / xã --"
                      )}
                    </option>
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  {errors.wardId && (
                    <p className="text-red-600 text-xs mt-1">{errors.wardId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="VD: Số 123, Đường Nguyễn Văn Linh"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors resize-none ${
                      errors.subAddress
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                    }`}
                    value={formData.subAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, subAddress: e.target.value })
                    }
                  />
                  {errors.subAddress && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.subAddress}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isDefault: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500 border-gray-300"
                  />
                  <label
                    htmlFor="isDefault"
                    className="text-sm text-gray-700 cursor-pointer flex items-center gap-2"
                  >
                    <Star className="w-4 h-4 text-yellow-500" />
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  disabled={
                    addAddressMutation.isLoading ||
                    updateAddressMutation.isLoading
                  }
                >
                  Hủy 
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    addAddressMutation.isLoading ||
                    updateAddressMutation.isLoading
                  }
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {addAddressMutation.isLoading ||
                  updateAddressMutation.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Lưu địa chỉ
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

