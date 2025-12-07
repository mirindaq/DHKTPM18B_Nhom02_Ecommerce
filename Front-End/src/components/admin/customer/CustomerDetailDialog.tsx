import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { useQuery } from "@/hooks";
import { customerService } from "@/services/customer.service";
import type {
  CustomerSummary,
  CustomerDetailResponse,
} from "@/types/customer.type";
import {
  Mail,
  Phone,
  Calendar,
  Users,
  Camera,
} from "lucide-react";
import { useRef } from "react";

interface CustomerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerSummary | null;
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Chưa cập nhật";
  // Đảm bảo xử lý lỗi parsing nếu cần, nhưng tạm thời giữ nguyên
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
};

export default function CustomerDetailDialog({
  open,
  onOpenChange,
  customer,
}: CustomerDetailDialogProps) {
  const { data: detailData, isLoading } = useQuery<CustomerDetailResponse>(
    () => customerService.getCustomerDetails(customer!.id),
    {
      queryKey: ["customerDetail", String(customer?.id ?? "")],
      enabled: !!customer && open,
    }
  );

  const customerDetail = detailData?.data;
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Tăng kích thước tối đa của Dialog */}
      <DialogContent className="sm:max-w-4xl max-w-[90vw] p-6 max-h-[90vh] overflow-y-auto"> 
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Chi tiết khách hàng</DialogTitle>
          <DialogDescription className="text-base mt-1 text-gray-600">
            Thông tin chi tiết của khách hàng{" "}
            <strong className="text-gray-900">{customer?.fullName}</strong>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Đang tải...</div>
        ) : customerDetail ? (
          <div className="space-y-6 mt-4">
            
            {/* THÔNG TIN CHÍNH: Bố cục 2 cột (Avatar + Địa chỉ) */}
            <div className="flex flex-col md:flex-row gap-8">
              
              {/* CỘT 1: Avatar + Thông tin cơ bản */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left md:w-1/3 space-y-4 border-b md:border-b-0 md:border-r pb-6 md:pr-6 md:pb-0">
                <div className="relative group cursor-pointer">
                  <img
                    src={
                      customerDetail.avatar || "/assets/avatar.jpg"
                    }
                    alt={customerDetail.fullName}
                    className="h-32 w-32 rounded-full object-cover border-4 border-blue-500/50 shadow-lg" // Thêm border nổi bật
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                  />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900">
                  {customerDetail.fullName}
                </h3>
                
                {/* Thông tin liên hệ xếp dọc gọn gàng hơn */}
                <div className="space-y-2 text-base w-full md:w-auto">
                    <p className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-5 w-5 text-gray-500" /> 
                        <span className="font-medium">{customerDetail.email}</span>
                    </p>
                    <p className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-5 w-5 text-gray-500" /> 
                        <span className="font-medium text-gray-900">{customerDetail.phone || "Chưa có"}</span>
                    </p>
                </div>
              </div>

              {/* CỘT 2: Địa chỉ */}
              <div className="md:w-2/3 space-y-4">
                <h4 className="text-xl font-bold text-gray-800">Địa chỉ ({customerDetail.addresses?.length || 0})</h4>
                
                {/* Danh sách Địa chỉ - Grid 2 cột nếu đủ không gian */}
                {customerDetail.addresses && customerDetail.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-3"> 
                    {customerDetail.addresses.map((addr, idx) => (
                      <div key={addr.id} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition duration-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-base text-gray-800">
                            {addr.addressName || `Địa chỉ ${idx + 1}`}
                          </span>
                          {addr.isDefault && (
                            <CustomBadge variant="info" size="sm" className="text-white">
                              Mặc định
                            </CustomBadge>
                          )}
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="text-gray-700">{addr.fullAddress}</p>
                          <p className="text-gray-600">
                            Người nhận: <strong className="text-gray-800">{addr.fullName}</strong>
                          </p>
                          <p className="text-gray-600">
                            SĐT: <strong className="text-gray-800">{addr.phone}</strong>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                    <p className="text-gray-500">Khách hàng chưa có địa chỉ nào được lưu.</p>
                )}
              </div>
            </div>

            {/* THÔNG TIN KHÁC: Trạng thái và Ngày sinh */}
            <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-base">
              
              {/* Trạng thái */}
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-400" />{" "}
                <span className="font-medium text-gray-600">Trạng thái:</span>
                <CustomBadge
                  variant={customerDetail.active ? "success" : "secondary"}
                >
                  {customerDetail.active ? "Hoạt động" : "Không hoạt động"}
                </CustomBadge>
              </div>

              {/* Ngày sinh */}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />{" "}
                <span className="font-medium text-gray-600">Ngày sinh:</span>
                <span className="text-gray-900 font-semibold">
                  {formatDate(customerDetail.dateOfBirth)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Không thể tải dữ liệu.
          </div>
        )}

        <DialogFooter className="mt-8">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}