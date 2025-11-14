import React, { useEffect, useState } from "react";
import { addressService } from "@/services/address.service";
import { authService } from "@/services/auth.service";
import { provinceService } from "@/services/province.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@/hooks/useQuery";
import { useMutation } from "@/hooks/useMutation";
import type { Address, CreateAddressRequest } from "@/types/address.type";
import type { Province } from "@/types/province.type";
import type { Ward } from "@/types/ward.type";

const Address: React.FC = () => {
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

      // ✅ Lấy provinceId và wardId từ address
      const provinceId = address.province?.id || address.wardId;
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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Danh sách địa chỉ</h2>
          <Button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2"
          >
            <span className="text-lg">➕</span>
            <span className="font-medium">Thêm địa chỉ</span>
          </Button>
        </div>

        {/* Thông báo lỗi chung */}
        {errorMessage && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertTitle>Có lỗi xảy ra</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Thông báo thành công */}
        {successMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertTitle>Thành công</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Chưa có địa chỉ nào.</p>
            <p className="text-sm text-gray-500 mt-2">
              Nhấn nút "Thêm địa chỉ" để tạo địa chỉ giao hàng đầu tiên
            </p>
          </div>
        ) : (
          <ul className="grid gap-4">
            {addresses.map((address) => (
              <li
                key={address.id}
                className={`p-4 rounded-2xl flex justify-between items-start shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-1 bg-white ${
                  address.isDefault ? "ring-1 ring-green-200" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-lg leading-tight">
                        {address.fullName}
                      </p>
                      {address.isDefault && (
                        <span className="inline-block mt-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          Mặc định
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-1">📞 {address.phone}</p>
                  <p className="text-gray-700 mb-1 truncate">
                    📍 {address.subAddress}
                  </p>
                  {address.fullAddress && (
                    <p className="text-sm text-gray-500 mt-1">
                      {address.fullAddress.replace(/\b[Pp]hường\s*/g, "")}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:brightness-95 transition text-sm"
                      title="Đặt làm địa chỉ mặc định"
                    >
                      ⭐
                    </button>
                  )}
                  <button
                    onClick={() => openModal(address)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:brightness-95 transition text-sm"
                    title="Chỉnh sửa địa chỉ"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:brightness-95 transition text-sm"
                    title="Xóa địa chỉ"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Modal thêm/sửa địa chỉ */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold">
                  {editingAddress
                    ? "✏️ Chỉnh sửa địa chỉ"
                    : "➕ Thêm địa chỉ mới"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 rounded-full p-2"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              {/* Lỗi validation trong modal */}
              {Object.keys(errors).length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-semibold text-sm mb-2">
                    ❌ Lỗi:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field} className="text-red-700 text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    className={`border rounded w-full p-2 focus:outline-none focus:ring-2 ${
                      errors.fullName
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
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
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="VD: 0912345678"
                    className={`border rounded w-full p-2 focus:outline-none focus:ring-2 ${
                      errors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
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
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Tỉnh / Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`border rounded w-full p-2 focus:outline-none focus:ring-2 ${
                      errors.provinceId
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
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
                    <option value="">-- Chọn tỉnh / thành phố --</option>
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
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Quận / Xã <span className="text-red-500">*</span>
                  </label>
                  <select
                    disabled={!selectedProvince || wardsLoading}
                    className={`border rounded w-full p-2 focus:outline-none focus:ring-2 ${
                      !selectedProvince || wardsLoading
                        ? "bg-gray-100 cursor-not-allowed"
                        : errors.wardId
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
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
                      {wardsLoading ? "Đang tải..." : "-- Chọn quận / xã --"}
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
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="VD: Số 123, Đường Nguyễn Văn Linh"
                    className={`border rounded w-full p-2 focus:outline-none focus:ring-2 min-h-[80px] ${
                      errors.subAddress
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
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

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isDefault: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Đặt làm địa chỉ mặc định
                  </span>
                </label>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={
                    addAddressMutation.isLoading ||
                    updateAddressMutation.isLoading
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addAddressMutation.isLoading ||
                  updateAddressMutation.isLoading
                    ? "⏳ Đang lưu..."
                    : "💾 Lưu"}
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Address;
