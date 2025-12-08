import { CustomBadge } from "@/components/ui/CustomBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cartService } from "@/services/cart.service";
import type { CartDetailResponse, CartWithCustomer } from "@/types/cart.type";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Package,
  Search,
  Send,
  ShoppingCart,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Carts() {
  const [carts, setCarts] = useState<CartWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // State cho việc chọn dòng
  const [selectedCartIds, setSelectedCartIds] = useState<number[]>([]);

  // State cho Dialog chi tiết
  const [selectedCart, setSelectedCart] = useState<CartWithCustomer | null>(
    null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // State cho Dialog xác nhận gửi mail
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const pageSize = 10;

  const fetchCarts = async () => {
    try {
      setLoading(true);
      // Reset selection khi chuyển trang hoặc reload
      setSelectedCartIds([]);
      const response = await cartService.getAllCarts(
        page,
        pageSize,
        searchKeyword
      );
      if (response.data) {
        setCarts(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error("Error fetching carts:", error);
      toast.error("Không thể tải danh sách giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, [page]); // Chỉ chạy lại khi page thay đổi. Search sẽ gọi hàm handleSearch riêng.

  const handleSearch = () => {
    setPage(0);
    fetchCarts();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleViewDetail = (cart: CartWithCustomer) => {
    setSelectedCart(cart);
    setDetailDialogOpen(true);
  };

  // --- Logic chọn Checkbox ---
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = carts.map((cart) => cart.cartId);
      setSelectedCartIds(allIds);
    } else {
      setSelectedCartIds([]);
    }
  };

  const handleSelectOne = (cartId: number, checked: boolean) => {
    if (checked) {
      setSelectedCartIds((prev) => [...prev, cartId]);
    } else {
      setSelectedCartIds((prev) => prev.filter((id) => id !== cartId));
    }
  };

  // --- Logic gửi Email ---
  const handleOpenConfirmDialog = () => {
    if (selectedCartIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một khách hàng");
      return;
    }
    setConfirmDialogOpen(true);
  };

  const handleSendReminders = async () => {
    try {
      setSendingEmail(true);
      await cartService.sendRemindersBatch(selectedCartIds);
      toast.success(
        `Đã gửi email nhắc nhở cho ${selectedCartIds.length} khách hàng`
      );
      setConfirmDialogOpen(false);
      setSelectedCartIds([]); // Reset selection sau khi gửi thành công
      fetchCarts(); // Load lại data để cập nhật cột "Last Reminder" (nếu có)
    } catch (error) {
      console.error("Error sending reminders:", error);
      toast.error("Có lỗi xảy ra khi gửi email");
    } finally {
      setSendingEmail(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Quản lý giỏ hàng khách hàng
            </CardTitle>
            <CustomBadge variant="secondary" size="sm">
              Tổng: {totalElements} giỏ hàng
            </CustomBadge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Thanh công cụ: Search & Send Reminders */}
          <div className="flex justify-between items-center mb-6">
            {/* Search area (Bên trái) */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên hoặc email khách hàng..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Tìm kiếm
              </Button>
            </div>

            {/* Send Reminders Button (Bên phải) */}
            <div>
              {selectedCartIds.length > 0 && (
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleOpenConfirmDialog}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Gửi nhắc nhở ({selectedCartIds.length})
                </Button>
              )}
            </div>
          </div>
          {/* Kết thúc Thanh công cụ */}

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : carts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Không có giỏ hàng nào có sản phẩm</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedCartIds.length === carts.length &&
                          carts.length > 0
                        }
                        onCheckedChange={(checked) =>
                          handleSelectAll(checked as boolean)
                        }
                      />
                    </TableHead>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cập nhật lần cuối</TableHead>
                    <TableHead className="text-center">Số SP</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead className="text-center w-24">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carts.map((cart, index) => (
                    <TableRow key={cart.cartId}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCartIds.includes(cart.cartId)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(cart.cartId, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>{page * pageSize + index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {cart.customerAvatar ? (
                              <AvatarImage src={cart.customerAvatar} />
                            ) : null}
                            <AvatarFallback className="bg-red-100 text-red-600">
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {cart.customerName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {cart.customerEmail}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        <div>{formatDate(cart.modifiedAt)}</div>
                        {/* Hiển thị thêm nếu cần: "Đã nhắc: ..." */}
                      </TableCell>
                      <TableCell className="text-center">
                        <CustomBadge variant="secondary">
                          {cart.totalItems}
                        </CustomBadge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        {formatPrice(cart.totalPrice)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(cart)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Hiển thị {page * pageSize + 1} -{" "}
                  {Math.min((page + 1) * pageSize, totalElements)} trong{" "}
                  {totalElements} giỏ hàng
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Trang {page + 1} / {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Cart Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Chi tiết giỏ hàng
            </DialogTitle>
          </DialogHeader>

          {selectedCart && (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      {selectedCart.customerAvatar ? (
                        <AvatarImage src={selectedCart.customerAvatar} />
                      ) : null}
                      <AvatarFallback className="bg-red-100 text-red-600 text-xl">
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedCart.customerName}
                      </h3>
                      <p className="text-gray-600">
                        {selectedCart.customerEmail}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {selectedCart.customerPhone || "Chưa cập nhật SĐT"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cart Items */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Sản phẩm trong giỏ ({selectedCart.totalItems})
                </h4>
                <div className="space-y-3">
                  {selectedCart.items.map((item: CartDetailResponse) => (
                    <Card key={item.id}>
                      <CardContent className="py-3">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium line-clamp-1">
                              {item.productName}
                            </h5>
                            <p className="text-sm text-gray-500">
                              SKU: {item.sku}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm">
                                Số lượng:{" "}
                                <CustomBadge variant="secondary">
                                  {item.quantity}
                                </CustomBadge>
                              </span>
                              {item.discount > 0 && (
                                <CustomBadge
                                  variant="error"
                                  className="text-xs"
                                >
                                  -{item.discount}%
                                </CustomBadge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-red-600">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatPrice(item.price)} / sp
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Total */}
              <Card className="bg-gray-50">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Tổng giá trị:</span>
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(selectedCart.totalPrice)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Sending Email */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận gửi email nhắc nhở</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn gửi email nhắc nhở giỏ hàng bị bỏ quên cho{" "}
              <strong>{selectedCartIds.length}</strong> khách hàng đã chọn
              không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={sendingEmail}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="default"
              onClick={handleSendReminders}
              disabled={sendingEmail}
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang gửi...
                </>
              ) : (
                "Gửi ngay"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
