import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { useQuery } from "@/hooks";
import { toast } from "sonner";
import { rankingService } from "@/services/ranking.service";
import { customerService } from "@/services/customer.service";
import { DatePicker } from "@/components/ui/date-picker";
import type { CreateVoucherRequest, Voucher, VoucherType } from "@/types/voucher.type";
import type { CustomerSummary } from "@/types/customer.type";
import CustomerSearchModal from "./CustomerSearchModal";
import SelectedItemsDisplay from "../promotion/SelectedItemsDisplay";

interface VoucherFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  discount: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  active: boolean;
  voucherType: VoucherType;
  code: string;
  selectedRankId: number | null;
  selectedCustomerIds: number[];
}

const getInitialFormData = (voucher: Voucher | null): VoucherFormData => {
  if (voucher) {
    return {
      name: voucher.name,
      description: voucher.description || "",
      startDate: voucher.startDate ? new Date(voucher.startDate).toISOString().split('T')[0] : "",
      endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().split('T')[0] : "",
      discount: voucher.discount,
      minOrderAmount: voucher.minOrderAmount || 0,
      maxDiscountAmount: voucher.maxDiscountAmount || 0,
      active: voucher.active ?? true,
      voucherType: voucher.voucherType,
      code: voucher.code || "",
      selectedRankId: voucher.ranking?.id || null,
      selectedCustomerIds: voucher.voucherCustomers?.map(vc => vc.customerId) || [],
    };
  }

  return {
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    discount: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    active: true,
    voucherType: "ALL",
    code: "",
    selectedRankId: null,
    selectedCustomerIds: [],
  };
};

interface VoucherFormProps {
  voucher?: Voucher;
  onSubmit: (data: CreateVoucherRequest) => void;
  onSendNotification?: (voucherId: number) => void;
  isLoading: boolean;
}

export default function VoucherForm({ voucher, onSubmit, onSendNotification, isLoading }: VoucherFormProps) {
  const [formData, setFormData] = useState<VoucherFormData>(() => getInitialFormData(voucher || null));
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<CustomerSummary[]>([]);

  // Update form data when voucher changes
  useEffect(() => {
    const initialData = getInitialFormData(voucher || null);
    setFormData(initialData);
    setSelectedCustomers([]);
  }, [voucher]);

  // Get rankings
  const { data: rankingsData } = useQuery(
    () => rankingService.getAllRankings(),
    { queryKey: ["rankings"] }
  );

  // Get customers for selected customer IDs (when editing)
  const uniqueCustomerIds = useMemo(() => {
    return [...new Set(formData.selectedCustomerIds)].sort((a, b) => a - b);
  }, [formData.selectedCustomerIds]);

  const { data: customersData } = useQuery(
    () => customerService.getCustomers({
      page: 1,
      size: 100,
    }),
    {
      queryKey: ["customers-for-voucher", uniqueCustomerIds.join(",")],
      enabled: formData.voucherType === "GROUP" && uniqueCustomerIds.length > 0,
    }
  );

  useEffect(() => {
    if (formData.voucherType === "GROUP" && customersData?.data?.data) {
      const customers = customersData.data.data;
      setSelectedCustomers(customers.filter((c: CustomerSummary) => uniqueCustomerIds.includes(c.id)));
    } else if (formData.voucherType === "GROUP" && uniqueCustomerIds.length === 0) {
      setSelectedCustomers([]);
    }
  }, [customersData, uniqueCustomerIds, formData.voucherType]);

  const rankings = rankingsData?.data || [];

  const handleValueChange = (field: keyof VoucherFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVoucherTypeChange = (type: VoucherType) => {
    handleValueChange("voucherType", type);
    handleValueChange("selectedRankId", null);
    handleValueChange("selectedCustomerIds", []);
    handleValueChange("code", "");
    setSelectedCustomers([]);
  };

  const handleCustomerSelect = (customer: CustomerSummary) => {
    const currentIds = formData.selectedCustomerIds || [];
    if (currentIds.includes(customer.id)) {
      handleValueChange("selectedCustomerIds", currentIds.filter((id) => id !== customer.id));
      setSelectedCustomers(selectedCustomers.filter((c) => c.id !== customer.id));
    } else {
      handleValueChange("selectedCustomerIds", [...currentIds, customer.id]);
      setSelectedCustomers([...selectedCustomers, customer]);
    }
  };

  const handleRemoveCustomer = (id: number) => {
    handleValueChange("selectedCustomerIds", formData.selectedCustomerIds.filter((i) => i !== id));
    setSelectedCustomers(selectedCustomers.filter((c) => c.id !== id));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Tên voucher là bắt buộc");
      return false;
    }

    if (!formData.startDate) {
      toast.error("Ngày bắt đầu là bắt buộc");
      return false;
    }

    if (!formData.endDate) {
      toast.error("Ngày kết thúc là bắt buộc");
      return false;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return false;
    }

    if (formData.discount <= 0 || formData.discount > 100) {
      toast.error("Giá trị giảm phải lớn hơn 0 và nhỏ hơn hoặc bằng 100");
      return false;
    }

    if (formData.voucherType === "ALL" && !formData.code.trim()) {
      toast.error("Mã voucher là bắt buộc cho loại 'Tất cả khách hàng'");
      return false;
    }

    if (formData.voucherType === "RANK" && !formData.selectedRankId) {
      toast.error("Vui lòng chọn hạng thành viên");
      return false;
    }

    if (formData.voucherType === "GROUP" && formData.selectedCustomerIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một khách hàng");
      return false;
    }

    return true;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: CreateVoucherRequest = {
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      discount: formData.discount,
      minOrderAmount: formData.minOrderAmount || undefined,
      maxDiscountAmount: formData.maxDiscountAmount || undefined,
      active: formData.active,
      voucherType: formData.voucherType,
      code: formData.voucherType === "ALL" ? formData.code : undefined,
      rankId: formData.voucherType === "RANK" ? formData.selectedRankId || undefined : undefined,
      voucherCustomers: formData.voucherType === "GROUP" 
        ? formData.selectedCustomerIds.map(id => ({ customerId: id })) 
        : undefined,
    };

    onSubmit(submitData);
  };

  const handleReset = () => {
    const initialData = getInitialFormData(null);
    setFormData(initialData);
    setSelectedCustomers([]);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {/* Thông tin cơ bản */}
      <div className="space-y-4 bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            1
          </span>
          Thông tin voucher
        </h3>
        <div className="space-y-6 pl-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>
                Tên voucher <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Nhập tên voucher..."
                value={formData.name}
                onChange={(e) => handleValueChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>
                Loại voucher <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.voucherType}
                onValueChange={(value) => handleVoucherTypeChange(value as VoucherType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả khách hàng</SelectItem>
                  <SelectItem value="RANK">Theo hạng thành viên</SelectItem>
                  <SelectItem value="GROUP">Nhóm khách hàng cụ thể</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Mô tả</Label>
            <Textarea
              placeholder="Nhập mô tả voucher..."
              value={formData.description}
              onChange={(e) => handleValueChange("description", e.target.value)}
              className="min-h-[80px] resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Cấu hình giảm giá & thời gian */}
      <div className="space-y-4 bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            2
          </span>
          Cấu hình giảm giá & thời gian
        </h3>
        <div className="space-y-6 pl-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label>
                Giá trị giảm (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.discount || ""}
                onChange={(e) => handleValueChange("discount", Number(e.target.value) || 0)}
                step="0.01"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-1">
              <Label>Đơn hàng tối thiểu (VNĐ)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.minOrderAmount || ""}
                onChange={(e) => handleValueChange("minOrderAmount", Number(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div className="space-y-1">
              <Label>Giảm tối đa (VNĐ)</Label>
              <Input
                type="number"
                placeholder="100000"
                value={formData.maxDiscountAmount || ""}
                onChange={(e) => handleValueChange("maxDiscountAmount", Number(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div className="space-y-1">
              <Label>
                Trạng thái <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => handleValueChange("active", checked)}
                />
                <Label className="text-sm text-gray-600">
                  {formData.active ? "Hoạt động" : "Tạm dừng"}
                </Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>
                Ngày bắt đầu <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                value={formData.startDate}
                onChange={(value) => handleValueChange("startDate", value)}
                placeholder="Chọn ngày bắt đầu"
              />
            </div>

            <div className="space-y-1">
              <Label>
                Ngày kết thúc <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                value={formData.endDate}
                onChange={(value) => handleValueChange("endDate", value)}
                placeholder="Chọn ngày kết thúc"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mã voucher cho loại ALL */}
      {formData.voucherType === "ALL" && (
        <div className="space-y-4 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </span>
            Mã voucher
          </h3>
          <div className="pl-10">
            <div className="space-y-1">
              <Label>
                Mã voucher <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Nhập mã voucher..."
                value={formData.code}
                onChange={(e) => handleValueChange("code", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Chọn hạng thành viên cho loại RANK */}
      {formData.voucherType === "RANK" && (
        <div className="space-y-4 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </span>
            Chọn hạng thành viên
          </h3>
          <div className="pl-10">
            <div className="space-y-1">
              <Label>
                Hạng thành viên <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.selectedRankId?.toString() || ""}
                onValueChange={(value) => handleValueChange("selectedRankId", value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hạng thành viên" />
                </SelectTrigger>
                <SelectContent>
                  {rankings.map((rank) => (
                    <SelectItem key={rank.id} value={rank.id.toString()}>
                      {rank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Chọn nhóm khách hàng cho loại GROUP */}
      {formData.voucherType === "GROUP" && (
        <div className="space-y-4 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </span>
            Chọn nhóm khách hàng
          </h3>
          <div className="pl-10 space-y-6">
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCustomerModalOpen(true)}
                className="h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm khách hàng
              </Button>
              <SelectedItemsDisplay
                items={selectedCustomers.map((c) => ({
                  id: c.id,
                  name: c.fullName,
                  thumbnail: c.avatar,
                }))}
                onRemove={handleRemoveCustomer}
                itemType="customer"
                emptyMessage="Chưa có khách hàng nào được chọn"
              />
            </div>

            {/* Display selected customers table for edit mode */}
            {voucher && selectedCustomers.length > 0 && (
              <div className="space-y-2">
                <Label>Thông tin khách hàng đã chọn</Label>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tên khách hàng</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Mã voucher</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomers.map((customer) => {
                        const voucherCustomer = voucher?.voucherCustomers?.find(vc => vc.customerId === customer.id);
                        return (
                          <tr key={customer.id} className="border-t">
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {customer.fullName}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {customer.email}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {voucherCustomer?.code || 'Chưa có mã'}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {voucherCustomer?.voucherCustomerStatus ? (
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  voucherCustomer.voucherCustomerStatus === 'SENT'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {voucherCustomer.voucherCustomerStatus === 'SENT' ? 'Đã gửi' : 'Nháp'}
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                  Chưa tạo
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 bg-white rounded-lg border p-6">
        {voucher && voucher.voucherType === "GROUP" && onSendNotification && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onSendNotification(voucher.id)}
            disabled={isLoading}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
          >
            Gửi thông báo voucher
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isLoading}
          className="h-11 px-6"
        >
          Xóa
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 h-11 px-8"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xử lý...
            </div>
          ) : voucher ? (
            "Cập nhật"
          ) : (
            "Tạo voucher"
          )}
        </Button>
      </div>

      <CustomerSearchModal
        open={isCustomerModalOpen}
        onOpenChange={setIsCustomerModalOpen}
        selectedIds={formData.selectedCustomerIds}
        onSelectCustomer={handleCustomerSelect}
      />
    </form>
  );
}
