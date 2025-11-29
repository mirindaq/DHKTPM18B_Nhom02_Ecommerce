import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PurchaseOrder } from "@/types/purchase-order.type";

interface PurchaseOrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrder | null;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return dateString;
};

export default function PurchaseOrderDetailDialog({
  open,
  onOpenChange,
  purchaseOrder,
}: PurchaseOrderDetailDialogProps) {
  if (!purchaseOrder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl">Chi tiết phiếu nhập hàng</DialogTitle>
          <p className="text-sm text-muted-foreground">Mã phiếu: PO-{purchaseOrder.id}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Thông tin chung */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Nhà cung cấp</p>
                <p className="font-semibold">{purchaseOrder.supplier.name}</p>
                <p className="text-xs text-muted-foreground">ID: {purchaseOrder.supplier.id}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Ngày nhập</p>
                <p className="font-semibold">{formatDate(purchaseOrder.purchaseDate)}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Người tạo</p>
                <p className="font-semibold">{purchaseOrder.staff.name}</p>
                <p className="text-xs text-muted-foreground">{purchaseOrder.staff.email}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">Tổng giá trị</p>
                <p className="text-xl font-bold text-green-600">
                  {formatPrice(purchaseOrder.totalPrice)}
                </p>
              </div>

              {purchaseOrder.note && (
                <div className="col-span-4">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Ghi chú</p>
                  <p className="text-sm bg-background p-3 rounded border">{purchaseOrder.note}</p>
                </div>
              )}
            </div>

            {/* Danh sách sản phẩm */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Danh sách sản phẩm nhập ({purchaseOrder.details.length} sản phẩm)
              </h3>

              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">STT</TableHead>
                      <TableHead className="w-[350px]">Sản phẩm</TableHead>
                      <TableHead className="w-[140px]">SKU</TableHead>
                      <TableHead className="text-right w-[140px]">Đơn giá</TableHead>
                      <TableHead className="text-center w-[100px]">Số lượng</TableHead>
                      <TableHead className="text-right w-[160px]">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {purchaseOrder.details.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={item.productVariant.productThumbnail}
                              alt={item.productVariant.productName}
                              className="w-12 h-12 rounded object-cover border flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {item.productVariant.productName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.productVariant.brandName}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {item.productVariant.sku}
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">
                          {formatPrice(item.price)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600 whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Tổng kết */}
            <div className="flex justify-end">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-[350px]">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tổng số lượng:</span>
                    <span className="font-semibold">
                      {purchaseOrder.details.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">TỔNG CỘNG:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(purchaseOrder.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
