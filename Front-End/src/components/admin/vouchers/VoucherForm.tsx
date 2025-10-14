import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQuery } from "@/hooks";
import { rankingService } from "@/services/ranking.service";
import { customerService } from "@/services/customer.service";
import type { CreateVoucherRequest, Voucher, VoucherType } from "@/types/voucher.type";

interface VoucherFormProps {
  voucher?: Voucher;
  onSubmit: (data: CreateVoucherRequest) => void;
  onSendNotification?: (voucherId: number) => void;
  isLoading: boolean;
}

export default function VoucherForm({ voucher, onSubmit, onSendNotification, isLoading }: VoucherFormProps) {
  const [voucherType, setVoucherType] = useState<VoucherType>("ALL");
  const [selectedRankId, setSelectedRankId] = useState<number | null>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [showSendNotificationDialog, setShowSendNotificationDialog] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateVoucherRequest>({
    defaultValues: {
      name: voucher?.name || "",
      description: voucher?.description || "",
      startDate: voucher?.startDate ? new Date(voucher.startDate).toISOString().split('T')[0] : "",
      endDate: voucher?.endDate ? new Date(voucher.endDate).toISOString().split('T')[0] : "",
      discount: voucher?.discount || 0,
      minOrderAmount: voucher?.minOrderAmount || 0,
      maxDiscountAmount: voucher?.maxDiscountAmount || 0,
      active: voucher?.active ?? true,
      voucherType: voucher?.voucherType || "ALL",
      code: voucher?.code || "",
    }
  });

  // Get rankings
  const { data: rankingsData } = useQuery(
    () => rankingService.getAllRankings(),
    { queryKey: ["rankings"] }
  );

  // Get customers for group selection
  const { data: customersData } = useQuery(
    () => customerService.getCustomers({
      page: 1,
      size: 100,
      name: searchCustomer || undefined
    }),
    {
      queryKey: ["customers", searchCustomer],
      enabled: voucherType === "GROUP"
    }
  );

  const rankings = rankingsData?.data || [];
  const customers = customersData?.data.data || [];

  useEffect(() => {
    if (voucher) {
      setVoucherType(voucher.voucherType);
      if (voucher.ranking) {
        setSelectedRankId(voucher.ranking.id);
      }
      if (voucher.voucherCustomers && voucher.voucherCustomers.length > 0) {
        setSelectedCustomerIds(voucher.voucherCustomers.map(vc => vc.customerId));
      }
    }
  }, [voucher]);

  const handleVoucherTypeChange = (type: VoucherType) => {
    setVoucherType(type);
    setSelectedRankId(null);
    setSelectedCustomerIds([]);
    setValue("voucherType", type);

    if (type === "ALL") {
      setValue("rankId", undefined);
      setValue("voucherCustomers", undefined);
    }
  };

  const handleRankSelect = (rankId: number) => {
    setSelectedRankId(rankId);
    setValue("rankId", rankId);
  };

  const handleCustomerToggle = (customerId: number) => {
    const newSelectedIds = selectedCustomerIds.includes(customerId)
      ? selectedCustomerIds.filter(id => id !== customerId)
      : [...selectedCustomerIds, customerId];

    setSelectedCustomerIds(newSelectedIds);
    setValue("voucherCustomers", newSelectedIds.map(id => ({ customerId: id })));
  };

  const onSubmitForm = (data: any) => {
    const submitData: CreateVoucherRequest = {
      ...data,
      voucherType,
      rankId: voucherType === "RANK" ? selectedRankId || undefined : undefined,
      voucherCustomers: voucherType === "GROUP" ? selectedCustomerIds.map(id => ({ customerId: id })) : undefined,
      code: voucherType === "ALL" ? data.code : undefined,
    };

    onSubmit(submitData);
  };

  const handleSendNotification = () => {
    if (onSendNotification && voucher?.id) {
      onSendNotification(voucher.id);
      setShowSendNotificationDialog(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin voucher</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên voucher *</Label>
            <Input
              id="name"
              {...register("name", { required: "Tên voucher là bắt buộc" })}
              placeholder="Nhập tên voucher"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Nhập mô tả voucher"
              rows={3}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Ngày bắt đầu *</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate", { required: "Ngày bắt đầu là bắt buộc" })}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Ngày kết thúc *</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate", { required: "Ngày kết thúc là bắt buộc" })}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Discount Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Giá trị giảm (%) *</Label>
              <Input
                id="discount"
                type="number"
                {...register("discount", {
                  required: "Giá trị giảm là bắt buộc",
                  min: { value: 0, message: "Giá trị phải lớn hơn 0" }
                })}
                placeholder="Nhập giá trị giảm"
              />
              {errors.discount && (
                <p className="text-sm text-red-500">{errors.discount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Đơn hàng tối thiểu (VNĐ)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                {...register("minOrderAmount", { min: 0 })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDiscountAmount">Giảm tối đa (VNĐ)</Label>
              <Input
                id="maxDiscountAmount"
                type="number"
                {...register("maxDiscountAmount", { min: 0 })}
                placeholder="100000"
              />
            </div>
          </div>

          {/* Voucher Type */}
          <div className="space-y-4">
            <Label>Loại voucher *</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={voucherType === "ALL" ? "default" : "outline"}
                onClick={() => handleVoucherTypeChange("ALL")}
              >
                Tất cả khách hàng
              </Button>
              <Button
                type="button"
                variant={voucherType === "RANK" ? "default" : "outline"}
                onClick={() => handleVoucherTypeChange("RANK")}
              >
                Theo hạng thành viên
              </Button>
              <Button
                type="button"
                variant={voucherType === "GROUP" ? "default" : "outline"}
                onClick={() => handleVoucherTypeChange("GROUP")}
              >
                Nhóm khách hàng cụ thể
              </Button>
            </div>
          </div>

          {/* Code input for ALL type */}
          {voucherType === "ALL" && (
            <div className="space-y-2">
              <Label htmlFor="code">Mã voucher *</Label>
              <Input
                id="code"
                {...register("code", { required: "Mã voucher là bắt buộc" })}
                placeholder="Nhập mã voucher"
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>
          )}

          {/* Rank selection for RANK type */}
          {voucherType === "RANK" && (
            <div className="space-y-2">
              <Label>Chọn hạng thành viên *</Label>
              <Select
                value={selectedRankId?.toString() || ""}
                onValueChange={(value) => handleRankSelect(parseInt(value))}
              >
                <SelectTrigger className="w-full">
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
          )}

          {/* Customer selection for GROUP type */}
          {voucherType === "GROUP" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tìm kiếm khách hàng</Label>
                <Input
                  placeholder="Nhập tên hoặc email khách hàng"
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Chọn khách hàng *</Label>
                <div className="max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
                  {Array.isArray(customers) ? customers.map((customer: any) => (
                    <div key={customer.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`customer-${customer.id}`}
                        checked={selectedCustomerIds.includes(customer.id)}
                        onCheckedChange={() => handleCustomerToggle(customer.id)}
                      />
                      <Label htmlFor={`customer-${customer.id}`} className="flex-1">
                        {customer.fullName} ({customer.email})
                      </Label>
                    </div>
                  )) : []}
                </div>
                {selectedCustomerIds.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Đã chọn {selectedCustomerIds.length} khách hàng
                  </p>
                )}
              </div>

              {/* Display selected customers table */}
              {selectedCustomerIds.length > 0 && (
                <div className="space-y-2">
                  <Label>Khách hàng đã chọn</Label>
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
                        {selectedCustomerIds.map((customerId) => {
                          const customer = customers.find((c: any) => c.id === customerId);
                          const voucherCustomer = voucher?.voucherCustomers?.find(vc => vc.customerId === customerId);
                          return (
                            <tr key={customerId} className="border-t">
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {customer?.fullName || voucherCustomer?.customerName || 'N/A'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {customer?.email || voucherCustomer?.email || 'N/A'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {voucherCustomer?.code || 'Chưa có mã'}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {voucherCustomer?.voucherCustomerStatus ? (
                                  <span className={`px-2 py-1 rounded-full text-xs ${voucherCustomer.voucherCustomerStatus === 'SENT'
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
          )}

          {/* Active status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={watch("active")}
              onCheckedChange={(checked) => setValue("active", checked)}
            />
            <Label htmlFor="active">Kích hoạt voucher</Label>
          </div>

          {/* Send notification button for edit mode */}
          {voucher && voucher.voucherType === "GROUP" && onSendNotification && (
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSendNotificationDialog(true)}
                disabled={isLoading}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
              >
                Gửi thông báo voucher
              </Button>
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : voucher ? "Cập nhật" : "Tạo voucher"}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Send notification dialog */}
      <AlertDialog open={showSendNotificationDialog} onOpenChange={setShowSendNotificationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gửi thông báo voucher</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có muốn gửi thông báo voucher đến khách hàng đã chọn không?
              Thông báo sẽ được gửi qua email đến tất cả khách hàng trong danh sách.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendNotification}>
              Gửi thông báo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
