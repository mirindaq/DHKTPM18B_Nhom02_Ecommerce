import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderResponse } from "@/types/order.type";
import type { Shipper } from "@/types/shipper.type";
import { useState } from "react";
import { Package, User, Phone, MapPin } from "lucide-react";

interface AssignShipperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderResponse | null;
  shippers: Shipper[];
  onAssign: (orderId: number, shipperId: number, notes?: string) => void;
  isAssigning?: boolean;
}

export default function AssignShipperDialog({
  open,
  onOpenChange,
  order,
  shippers,
  onAssign,
  isAssigning = false,
}: AssignShipperDialogProps) {
  const [selectedShipperId, setSelectedShipperId] = useState<string>("");
  const [notes, setNotes] = useState("");

  if (!order) return null;

  const handleAssign = () => {
    if (selectedShipperId) {
      onAssign(order.id, parseInt(selectedShipperId), notes);
      setSelectedShipperId("");
      setNotes("");
    }
  };

  const handleClose = () => {
    setSelectedShipperId("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Gán shipper cho đơn hàng #{order.id}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Chọn shipper để giao đơn hàng này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">
                Thông tin đơn hàng
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <User className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-600">Người nhận</p>
                  <p className="font-medium text-gray-900">
                    {order.receiverName}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-600">Số điện thoại</p>
                  <p className="font-medium text-gray-900">
                    {order.receiverPhone}
                  </p>
                </div>
              </div>

              {order.receiverAddress && (
                <div className="col-span-2 flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Địa chỉ giao hàng</p>
                    <p className="font-medium text-gray-900">
                      {order.receiverAddress}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipper Selection */}
          <div className="space-y-2">
            <Label htmlFor="shipper" className="text-sm font-semibold">
              Chọn shipper <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedShipperId}
              onValueChange={setSelectedShipperId}
            >
              <SelectTrigger id="shipper">
                <SelectValue placeholder="-- Chọn shipper --" />
              </SelectTrigger>
              <SelectContent>
                {shippers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Không có shipper khả dụng
                  </div>
                ) : (
                  shippers.map((shipper) => (
                    <SelectItem key={shipper.id} value={shipper.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{shipper.fullName}</span>
                        <span className="text-gray-500 text-sm">
                          ({shipper.phone})
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold">
              Ghi chú (tùy chọn)
            </Label>
            <Textarea
              id="notes"
              placeholder="Nhập ghi chú cho shipper..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isAssigning}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedShipperId || isAssigning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAssigning ? "Đang gán..." : "Gán shipper"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
