import { useEffect, useState } from "react";
import { addressService } from "@/services/address.service";
import { authService } from "@/services/auth.service";
import { provinceService } from "@/services/province.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import AddressCard from "@/components/user/AddressCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useQuery } from "@/hooks/useQuery";
import { useMutation } from "@/hooks/useMutation";
import {
  MapPin,
  Plus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import ConfirmDeleteDialog from "@/components/user/ConfirmDeleteDialog";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

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
    setAddressToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (addressToDelete) {
      deleteAddressMutation.mutate(addressToDelete);
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAddressToDelete(null);
  };

  // 🌟 Đặt mặc định
  const handleSetDefault = async (id: number) => {
    setDefaultMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Delete Address Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleteAddressMutation.isLoading}
        title="Xóa địa chỉ"
        description="Bạn có chắc chắn muốn xóa địa chỉ này không?"
        message="Sau khi xóa, địa chỉ này sẽ không thể khôi phục lại. Bạn sẽ cần thêm lại địa chỉ nếu muốn sử dụng."
      />
      {/* Thông báo lỗi chung */}
      {errorMessage && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTitle>Có lỗi xảy ra</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Thông báo thành công */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle>Thành công</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Header với nút thêm */}
      <div className="flex items-center justify-end">
        <Button
          onClick={() => openModal()}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm địa chỉ mới
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-4" />
          <p className="text-gray-600">Đang tải danh sách địa chỉ...</p>
        </div>
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
              <Button
                onClick={() => openModal()}
                className="bg-red-600 hover:bg-red-700"
              >
                Thêm địa chỉ mới
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={openModal}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              isDeleting={deleteAddressMutation.isLoading}
            />
          ))}
        </div>
      )}

      {/* Modal thêm/sửa địa chỉ */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingAddress ? (
                <>
                  Chỉnh sửa địa chỉ
                </>
              ) : (
                <>
                  Thêm địa chỉ mới
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? "Cập nhật thông tin địa chỉ của bạn"
                : "Thêm địa chỉ giao hàng mới vào danh sách"}
            </DialogDescription>
          </DialogHeader>

          <div>
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
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className={
                      errors.fullName
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                    aria-invalid={!!errors.fullName}
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="VD: 0912345678"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={
                      errors.phone
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Province select */}
                <div className="space-y-2">
                  <Label htmlFor="province" className="text-sm font-medium text-gray-700">
                    Tỉnh / Thành phố <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedProvince ? String(selectedProvince) : ""}
                    onValueChange={(value) => {
                      const id = Number(value);
                      setSelectedProvince(id || "");
                      setSelectedWard("");
                      setErrors((prev) => {
                        const cp = { ...prev };
                        delete cp.provinceId;
                        delete cp.wardId;
                        return cp;
                      });
                    }}
                    disabled={provincesLoading}
                  >
                    <SelectTrigger
                      id="province"
                      className={
                        errors.provinceId
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                      aria-invalid={!!errors.provinceId}
                    >
                      <SelectValue
                        placeholder={
                          provincesLoading
                            ? "Đang tải..."
                            : "-- Chọn tỉnh / thành phố --"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.provinceId && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.provinceId}
                    </p>
                  )}
                </div>

                {/* Ward select */}
                <div className="space-y-2">
                  <Label htmlFor="ward" className="text-sm font-medium text-gray-700">
                    Quận / Xã <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedWard ? String(selectedWard) : ""}
                    onValueChange={(value) => {
                      const id = Number(value);
                      setSelectedWard(id || "");
                      setErrors((prev) => {
                        const cp = { ...prev };
                        delete cp.wardId;
                        return cp;
                      });
                    }}
                    disabled={!selectedProvince || wardsLoading}
                  >
                    <SelectTrigger
                      id="ward"
                      className={
                        errors.wardId
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                      aria-invalid={!!errors.wardId}
                    >
                      <SelectValue
                        placeholder={
                          wardsLoading
                            ? "Đang tải..."
                            : "-- Chọn quận / xã --"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.wardId && (
                    <p className="text-red-600 text-xs mt-1">{errors.wardId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subAddress" className="text-sm font-medium text-gray-700">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="subAddress"
                    placeholder="VD: Số 123, Đường Nguyễn Văn Linh"
                    rows={3}
                    value={formData.subAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, subAddress: e.target.value })
                    }
                    className={
                      errors.subAddress
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                    aria-invalid={!!errors.subAddress}
                  />
                  {errors.subAddress && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.subAddress}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        isDefault: checked === true,
                      })
                    }
                    className="border-gray-300"
                  />
                  <Label
                    htmlFor="isDefault"
                    className="text-sm text-gray-700 cursor-pointer flex items-center gap-2"
                  >
                    Đặt làm địa chỉ mặc định
                  </Label>
                </div>
              </div>

            <DialogFooter className="gap-2 sm:gap-0">
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
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
