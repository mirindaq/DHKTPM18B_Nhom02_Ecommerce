import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@/hooks";
import { customerService } from "@/services/customer.service";
import type {
  CustomerSummary,
  CustomerDetailResponse,
} from "@/types/customer.type";
import {
  Mail,
  Phone,
  MapPin,
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
  return new Date(dateString).toLocaleDateString("vi-VN");
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
      <DialogContent className="sm:max-w-3xl max-w-[90vw] p-6">
        <DialogHeader>
          <DialogTitle className="">Chi tiết khách hàng</DialogTitle>
          <DialogDescription className="text-base mt-1">
            Thông tin chi tiết của khách hàng{" "}
            <strong>{customer?.fullName}</strong>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Đang tải...</div>
        ) : customerDetail ? (
          <div className="space-y-8 mt-4">
            {/* Avatar + Tên + Email */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className="relative group cursor-pointer"

              >
                <img
                  src={
                    customerDetail.avatar || "/assets/avatar.jpg"
                  }
                  alt={customerDetail.fullName}
                  className="h-32 w-32 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-40 opacity-0 group-:opacity-100 transition-opacity">
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
              <p className="flex items-center gap-2 text-gray-600 text-lg">
                <Mail className="h-5 w-5" /> {customerDetail.email}
              </p>
            </div>

            {/* Thông tin chi tiết */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-base">
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" />{" "}
                <span className="font-medium text-gray-500">Số điện thoại:</span>
                <span className="text-gray-900 font-semibold">
                  {customerDetail.phone || "Chưa có"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="text-gray-400" />{" "}
                <span className="font-medium text-gray-500">Địa chỉ:</span>
                <span className="text-gray-900 font-semibold">
                  {customerDetail.address || "Chưa cập nhật"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" />{" "}
                <span className="font-medium text-gray-500">Ngày tham gia:</span>
                <span className="text-gray-900 font-semibold">
                  {formatDate(customerDetail.registerDate)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Users className="text-gray-400" />{" "}
                <span className="font-medium text-gray-500">Trạng thái:</span>
                <Badge
                  className={
                    customerDetail.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {customerDetail.active ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" />{" "}
                <span className="font-medium text-gray-500">Ngày sinh:</span>
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
