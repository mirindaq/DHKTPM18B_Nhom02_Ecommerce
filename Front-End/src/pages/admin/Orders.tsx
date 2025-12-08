import {
  OrderDetailDialog,
  OrderFilter,
  OrderTable,
} from "@/components/admin/orders";
import Pagination from "@/components/ui/pagination";
import { useMutation, useQuery } from "@/hooks";
import { orderService } from "@/services/order.service";
import type {
  OrderListResponse,
  OrderResponse,
  OrderSearchParams,
  OrderStatus,
} from "@/types/order.type";
import jsPDF from "jspdf";
import { useState } from "react";
import { toast } from "sonner";

const statusConfig: Record<OrderStatus, { label: string; color?: string }> = {
  PENDING: { label: "Chờ xử lý" },
  PENDING_PAYMENT: { label: "Chờ thanh toán" },
  PROCESSING: { label: "Đang xử lý" },
  READY_FOR_PICKUP: { label: "Sẵn sàng lấy hàng" },
  SHIPPED: { label: "Đã giao cho ĐVVC" },
  ASSIGNED_SHIPPER: { label: "Đã gán Shipper" },
  DELIVERING: { label: "Đang giao hàng" },
  FAILED: { label: "Giao thất bại" },
  CANCELED: { label: "Đã hủy" },
  COMPLETED: { label: "Hoàn thành" },
  PAYMENT_FAILED: { label: "Thanh toán thất bại" },
};

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<OrderSearchParams>({});

  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
  } = useQuery<OrderListResponse>(
    () =>
      orderService.getAllOrdersForAdmin({
        ...searchParams,
        page: currentPage,
        size: pageSize,
      }),
    {
      queryKey: [
        "orders",
        currentPage.toString(),
        pageSize.toString(),
        JSON.stringify(searchParams),
      ],
    }
  );

  const pagination = ordersData?.data;
  const orders = ordersData?.data?.data || [];

  // --- MUTATIONS ---

  const confirmOrderMutation = useMutation(
    (orderId: number) => orderService.confirmOrder(orderId),
    {
      onSuccess: () => {
        toast.success("Tiếp nhận đơn hàng thành công");
        refetchOrders();
        setIsDetailDialogOpen(false);
        setSelectedOrder(null);
      },
      onError: (error: any) => {
        console.error("Error confirming order:", error);
        toast.error(
          error?.response?.data?.message || "Không thể tiếp nhận đơn hàng"
        );
      },
    }
  );

  const cancelOrderMutation = useMutation(
    (orderId: number) => orderService.cancelOrder(orderId),
    {
      onSuccess: () => {
        toast.success("Hủy đơn hàng thành công");
        refetchOrders();
        setIsDetailDialogOpen(false);
        setSelectedOrder(null);
      },
      onError: (error: any) => {
        console.error("Error canceling order:", error);
        toast.error(error?.response?.data?.message || "Không thể hủy đơn hàng");
      },
    }
  );

  const processOrderMutation = useMutation(
    (orderId: number) => orderService.processOrder(orderId),
    {
      onSuccess: () => {
        toast.success("Xử lý đơn hàng thành công");
        refetchOrders();
        setIsDetailDialogOpen(false);
        setSelectedOrder(null);
      },
      onError: (error: any) => {
        console.error("Error processing order:", error);
        toast.error(
          error?.response?.data?.message || "Không thể xử lý đơn hàng"
        );
      },
    }
  );

  const completeOrderMutation = useMutation(
    (orderId: number) => orderService.completeOrder(orderId),
    {
      onError: (error: any) => {
        console.error("Error completing order:", error);
        toast.error(
          error?.response?.data?.message || "Không thể hoàn thành đơn hàng"
        );
      },
    }
  );

  // --- HANDLERS ---

  const handleViewDetail = (order: OrderResponse) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleConfirmOrder = (orderId: number) => {
    confirmOrderMutation.mutate(orderId);
  };

  const handleCancelOrder = (orderId: number) => {
    cancelOrderMutation.mutate(orderId);
  };

  const handleProcessOrder = (orderId: number) => {
    processOrderMutation.mutate(orderId);
  };

  const handleCompleteOrder = async (orderId: number) => {
    if (!selectedOrder) {
      toast.error("Không tìm thấy thông tin đơn hàng để hoàn thành.");
      return;
    }

    try {
      await completeOrderMutation.mutate(orderId);

      toast.success("Đơn hàng đã hoàn thành!");
      refetchOrders();
      setIsDetailDialogOpen(false);
      setSelectedOrder(null);

      try {
        const orderForPdf: OrderResponse = {
          ...selectedOrder,
          status: "COMPLETED",
        };
        generateAndDownloadInvoicePdf(orderForPdf);
        toast.success("Đang tải hóa đơn...");
      } catch (pdfError) {
        console.error("Lỗi khi tạo PDF:", pdfError);
        toast.warning("Đơn hàng đã hoàn thành nhưng lỗi khi xuất file PDF.");
      }
    } catch (apiError) {
      console.error("Lỗi quy trình hoàn thành đơn:", apiError);
    }
  };

  const handleExportPdf = (orderId: number) => {
    const order = orders.find(o => o.id === orderId) || selectedOrder;
    
    if (!order) {
      toast.error("Không tìm thấy thông tin đơn hàng.");
      return;
    }

    if (order.status !== "COMPLETED") {
      toast.error("Chỉ có thể xuất hóa đơn cho đơn hàng đã hoàn thành.");
      return;
    }

    try {
      generateAndDownloadInvoicePdf(order);
      toast.success("Đã xuất hóa đơn PDF thành công!");
    } catch (error) {
      console.error("Lỗi khi xuất PDF:", error);
      toast.error("Không thể xuất file PDF. Vui lòng thử lại.");
    }
  };

  const generateAndDownloadInvoicePdf = (order: OrderResponse) => {
    const doc = new jsPDF();

    // --- CONSTANTS ---
    const PAGE_WIDTH = doc.internal.pageSize.getWidth();
    const MARGIN_LEFT = 12;
    const MARGIN_RIGHT = PAGE_WIDTH - 12;
    const LINE_HEIGHT = 7;
    let y = 15;

    // Căn cột bảng
    const COLS = {
      STT: MARGIN_LEFT,
      SAN_PHAM: MARGIN_LEFT + 12,
      SL: MARGIN_RIGHT - 80,
      DON_GIA: MARGIN_RIGHT - 40,
      THANH_TIEN: MARGIN_RIGHT,
    };

    const SUMMARY_LABEL_X = MARGIN_RIGHT - 65;
    const SUMMARY_VALUE_X = MARGIN_RIGHT;

    const textNoAccent = (str: string) => removeVietnameseTones(str || "");

    // ======= HEADER =======
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("HOA DON BAN HANG", PAGE_WIDTH / 2, y, { align: "center" });
    y += LINE_HEIGHT * 2;

    // ======= INFO =======
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(`Ma don hang: #${order.id}`, MARGIN_LEFT, y);
    doc.text(`Ngay dat: ${formatDate(order.orderDate)}`, MARGIN_RIGHT, y, {
      align: "right",
    });
    y += LINE_HEIGHT;

    const statusLabel = textNoAccent(statusConfig[order.status]?.label);
    doc.text(`Trang thai: ${statusLabel}`, MARGIN_LEFT, y);
    y += LINE_HEIGHT * 1.2;

    // ======= CUSTOMER =======
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("THONG TIN KHACH HANG", MARGIN_LEFT, y);
    y += LINE_HEIGHT;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(`Nguoi nhan: ${textNoAccent(order.receiverName)}`, MARGIN_LEFT, y);
    y += LINE_HEIGHT;

    doc.text(`SDT: ${order.receiverPhone}`, MARGIN_LEFT, y);
    y += LINE_HEIGHT;

    const addr = textNoAccent(order.receiverAddress);
    const addrWrap = doc.splitTextToSize(`Dia chi: ${addr}`, PAGE_WIDTH - 24);
    doc.text(addrWrap, MARGIN_LEFT, y);
    y += LINE_HEIGHT * addrWrap.length + 4;

    // ======= TABLE HEADER =======
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("CHI TIET DON HANG", MARGIN_LEFT, y);
    y += LINE_HEIGHT;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.line(MARGIN_LEFT, y - 3, MARGIN_RIGHT, y - 3);

    doc.text("STT", COLS.STT, y + 2);
    doc.text("San pham", COLS.SAN_PHAM, y + 2);
    doc.text("SL", COLS.SL, y + 2, { align: "right" });
    doc.text("Don gia", COLS.DON_GIA, y + 2, { align: "right" });
    doc.text("Thanh tien", COLS.THANH_TIEN, y + 2, { align: "right" });

    y += 5;
    doc.line(MARGIN_LEFT, y, MARGIN_RIGHT, y);
    y += 5;

    doc.setFont("helvetica", "normal");

    // ======= TABLE BODY =======
    order.orderDetails.forEach((item, index) => {
      const name = textNoAccent(item.productVariant.productName);
      const nameWidth = COLS.SL - COLS.SAN_PHAM - 5;
      const nameLines = doc.splitTextToSize(name, nameWidth);

      doc.text(String(index + 1), COLS.STT, y);
      doc.text(nameLines, COLS.SAN_PHAM, y);

      doc.text(String(item.quantity), COLS.SL, y, { align: "right" });
      doc.text(formatPrice(item.price), COLS.DON_GIA, y, { align: "right" });
      doc.text(formatPrice(item.finalPrice), COLS.THANH_TIEN, y, {
        align: "right",
      });

      y += LINE_HEIGHT * nameLines.length;
    });

    y += 3;
    doc.line(MARGIN_LEFT, y, MARGIN_RIGHT, y);
    y += LINE_HEIGHT;

    // ======= SUMMARY =======
    const shippingFee =
      order.finalTotalPrice - order.totalPrice + order.totalDiscount;

    doc.setFontSize(11);

    const addSummary = (label: string, value: string) => {
      doc.text(label, SUMMARY_LABEL_X, y, { align: "right" });
      doc.text(value, SUMMARY_VALUE_X, y, { align: "right" });
      y += LINE_HEIGHT;
    };

    addSummary("Tong tien hang:", formatPrice(order.totalPrice));
    addSummary("Phi van chuyen:", formatPrice(shippingFee));
    addSummary("Giam gia:", `-${formatPrice(order.totalDiscount)}`);

    y += 3;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    addSummary("TONG THANH TOAN:", formatPrice(order.finalTotalPrice));

    doc.save(`HoaDon_${order.id}.pdf`);
  };

  // --- HELPER FUNCTIONS ---

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (filters: {
    customerName?: string;
    orderDate?: string;
    customerPhone?: string;
    status?: OrderStatus;
    isPickup?: boolean;
  }) => {
    setSearchParams(filters);
    setCurrentPage(1);
  };

  const getTotalRevenue = () => {
    return orders
      .filter(
        (order) =>
          order.status === "COMPLETED" ||
          order.status === "SHIPPED" ||
          order.status === "DELIVERING"
      )
      .reduce((sum, order) => sum + order.finalTotalPrice, 0);
  };

  const getPendingOrdersCount = () => {
    return orders.filter((order) => order.status === "PENDING").length;
  };

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return "0 VND";
    return new Intl.NumberFormat("vi-VN").format(price) + " VND";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const removeVietnameseTones = (str: string) => {
    if (!str) return "";
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
  };

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Quản lý đơn hàng
        </h1>
        <p className="text-lg text-gray-600">
          Quản lý và theo dõi tất cả đơn hàng trong hệ thống
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Tổng đơn hàng</p>
          <p className="text-2xl font-bold text-blue-700">
            {pagination?.totalItem || 0}
          </p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600 font-medium">Đơn chờ xử lý</p>
          <p className="text-2xl font-bold text-yellow-700">
            {getPendingOrdersCount()}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-medium">Doanh thu</p>
          <p className="text-2xl font-bold text-green-700">
            {formatPrice(getTotalRevenue())}
          </p>
        </div>
      </div>

      {/* Filter */}
      <OrderFilter onSearch={handleSearch} isLoading={isLoadingOrders} />

      {/* Table */}
      <OrderTable
        orders={orders}
        onViewDetail={handleViewDetail}
        isLoading={isLoadingOrders}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={
          searchParams.customerName || searchParams.customerPhone || ""
        }
      />

      {/* Pagination */}
      {pagination && pagination.totalPage > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Detail Dialog */}
      <OrderDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={handleCloseDetailDialog}
        order={selectedOrder}
        onConfirmOrder={handleConfirmOrder}
        onCancelOrder={handleCancelOrder}
        onProcessOrder={handleProcessOrder}
        onCompleteOrder={handleCompleteOrder}
        onExportPdf={handleExportPdf}
        isConfirming={confirmOrderMutation.isLoading}
        isCanceling={cancelOrderMutation.isLoading}
        isProcessing={processOrderMutation.isLoading}
        isCompleting={completeOrderMutation.isLoading}
      />
    </div>
  );
}
