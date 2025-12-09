import { CustomBadge } from "@/components/ui/CustomBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Eye,
  Loader2,
  Package,
  Search,
  Send,
  ShoppingCart,
  User,
} from "lucide-react";
import Pagination from "@/components/ui/pagination";
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
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý giỏ hàng
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý và theo dõi giỏ hàng của khách hàng
          </p>
        </div>
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

      {/* Search bar */}
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

      {/* Table */}
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Tổng cộng:{" "}
          <span className="font-semibold text-gray-900">{totalElements}</span>{" "}
          giỏ hàng
        </div>

        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
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
                <TableHead className="text-center font-semibold w-16">STT</TableHead>
                <TableHead className="font-semibold">Khách hàng</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Cập nhật lần cuối</TableHead>
                <TableHead className="font-semibold text-center">Số SP</TableHead>
                <TableHead className="font-semibold text-right">Tổng tiền</TableHead>
                <TableHead className="font-semibold text-center w-24">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                      <p className="text-gray-500 font-medium">
                        Đang tải dữ liệu...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : carts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-24 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-gray-600">
                          Không có giỏ hàng nào
                        </p>
                        <p className="text-sm text-gray-400">
                          Chưa có khách hàng nào có sản phẩm trong giỏ hàng
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                carts.map((cart, index) => (
                  <TableRow key={cart.cartId} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedCartIds.includes(cart.cartId)}
                        onCheckedChange={(checked) =>
                          handleSelectOne(cart.cartId, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center font-medium text-gray-600">
                      {page * pageSize + index + 1}
                    </TableCell>
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
                        <span className="font-semibold text-gray-900">
                          {cart.customerName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {cart.customerEmail}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {formatDate(cart.modifiedAt)}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage - 1)}
            />
          </div>
        )}
      </div>

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
