import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomBadge } from "@/components/ui/CustomBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, Star, Phone, MapPin, AlertTriangle } from "lucide-react";
import type { Address } from "@/types/address.type";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  isDeleting?: boolean;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting = false,
}: AddressCardProps) {
  const [showDefaultDialog, setShowDefaultDialog] = useState(false);

  const handleSetDefaultClick = () => {
    setShowDefaultDialog(true);
  };

  const handleConfirmSetDefault = () => {
    onSetDefault(address.id);
    setShowDefaultDialog(false);
  };
  return (
    <>
      <Card
        className={`overflow-hidden hover:shadow-lg transition-shadow ${
          address.isDefault
            ? "ring-2 ring-green-500 border-green-200 bg-green-50/30"
            : ""
        }`}
      >
        <CardContent className="p-0">
          {/* Address Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <span className="text-sm text-gray-600">Tên người nhận:</span>
                <span className="font-bold text-gray-900 ml-2">
                  {address.fullName}
                </span>
              </div>
              {address.isDefault && (
                <>
                  <span className="text-gray-400">•</span>
                  <CustomBadge
                    variant="success"
                    size="sm"
                    className="!bg-green-600 !text-white !font-semibold"
                  >
                    <Star className="w-3 h-3 mr-1 fill-white" />
                    Mặc định
                  </CustomBadge>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!address.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSetDefaultClick}
                  className="text-sm"
                  title="Đặt làm địa chỉ mặc định"
                >
                  Mặc định
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(address)}
                className="text-sm"
                title="Chỉnh sửa địa chỉ"
              >
                <Edit className="w-4 h-4 mr-1" />
                Sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(address.id)}
                disabled={isDeleting}
                className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Xóa địa chỉ"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Xóa
              </Button>
            </div>
          </div>

          {/* Address Content */}
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 shrink-0" />
                <span>
                  Số điện thoại:{" "}
                  <span className="font-semibold">{address.phone}</span>
                </span>
              </div>

              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">{address.subAddress}</p>
                  {address.fullAddress && (
                    <p className="text-gray-500">
                      {address.fullAddress.replace(/\b[Pp]hường\s*/g, "")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Set Default Confirmation Dialog */}
      <Dialog open={showDefaultDialog} onOpenChange={setShowDefaultDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <DialogTitle className="text-lg">
                  Đặt làm địa chỉ mặc định
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Bạn có chắc chắn muốn đặt địa chỉ này làm mặc định không?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Địa chỉ này sẽ được sử dụng làm địa chỉ mặc định cho các đơn hàng
              tiếp theo của bạn. Địa chỉ mặc định hiện tại sẽ được thay thế.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDefaultDialog(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmSetDefault}
              className="bg-green-600 hover:bg-green-700"
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

