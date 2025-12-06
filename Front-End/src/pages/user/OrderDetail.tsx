import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { orderService } from "@/services/order.service";
import { feedbackService } from "@/services/feedback.service";
import { uploadService } from "@/services/upload.service";
import { useQuery } from "@/hooks/useQuery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  ChevronLeft,
  Loader2,
  CreditCard,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Star,
  Store,
  ImagePlus,
  X,
} from "lucide-react";
import type {
  OrderApiResponse,
  OrderStatus,
  OrderDetailResponse,
} from "@/types/order.type";
import type { Feedback } from "@/types/feedback.type";
import { PUBLIC_PATH } from "@/constants/path";
import { toast } from "sonner";

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Store address constant
  const STORE_ADDRESS = "CellphoneS - 125 Trần Phú, Hải Châu, Đà Nẵng";

  // Feedback states
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [viewFeedbackDialogOpen, setViewFeedbackDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<OrderDetailResponse | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<
    Record<number, Feedback | null>
  >({});
  const [loadingFeedbackStatus, setLoadingFeedbackStatus] = useState(false);

  // Fetch order detail using useQuery
  const {
    data: orderData,
    isLoading,
    error: orderError,
  } = useQuery<OrderApiResponse>(
    () => {
      if (!id) throw new Error("Order ID is required");
      return orderService.getOrderDetailById(parseInt(id));
    },
    {
      queryKey: ["orderDetail", id || ""],
      enabled: !!id,
      onError: (err) => {
        console.error("Error fetching order detail:", err);
        const error = err as any;
        const errorMsg =
          error.response?.data?.message || "Không thể tải thông tin đơn hàng";
        toast.error(errorMsg);
      },
    }
  );

  const order = orderData?.data;

  // Load feedback status for each product when order is loaded
  const loadFeedbackStatus = async () => {
    if (!order || order.status !== "COMPLETED") return;

    setLoadingFeedbackStatus(true);
    const status: Record<number, Feedback | null> = {};

    for (const detail of order.orderDetails) {
      try {
        const isReviewed = await feedbackService.checkIfReviewed(
          order.id,
          detail.productVariant.id
        );
        if (isReviewed.data) {
          const feedbackDetail = await feedbackService.getFeedbackDetail(
            order.id,
            detail.productVariant.id
          );
          status[detail.productVariant.id] = feedbackDetail.data;
        } else {
          status[detail.productVariant.id] = null;
        }
      } catch {
        status[detail.productVariant.id] = null;
      }
    }

    setFeedbackStatus(status);
    setLoadingFeedbackStatus(false);
  };

  // Load feedback status when order changes
  if (
    order &&
    order.status === "COMPLETED" &&
    Object.keys(feedbackStatus).length === 0 &&
    !loadingFeedbackStatus
  ) {
    loadFeedbackStatus();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status: OrderStatus) => {
    if (["PENDING", "PENDING_PAYMENT"].includes(status)) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
          Chờ xác nhận
        </Badge>
      );
    } else if (["PROCESSING", "READY_FOR_PICKUP", "SHIPPED"].includes(status)) {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
          Đã xác nhận
        </Badge>
      );
    } else if (status === "DELIVERING") {
      return (
        <Badge className="bg-purple-100 text-purple-700 border-purple-300">
          Đang vận chuyển
        </Badge>
      );
    } else if (status === "COMPLETED") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300">
          Hoàn thành
        </Badge>
      );
    } else if (["FAILED", "CANCELED", "PAYMENT_FAILED"].includes(status)) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-300">Đã hủy</Badge>
      );
    }
    return <Badge>{status}</Badge>;
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "CASH_ON_DELIVERY":
        return "Thanh toán khi nhận hàng";
      case "VN_PAY":
        return "VNPay";
      case "PAY_OS":
        return "PayOS";
      default:
        return method;
    }
  };

  // Feedback handlers
  const openFeedbackDialog = (detail: OrderDetailResponse) => {
    setSelectedProduct(detail);
    setRating(5);
    setComment("");
    setSelectedImages([]);
    setPreviewUrls([]);
    setFeedbackDialogOpen(true);
  };

  const openViewFeedbackDialog = (
    detail: OrderDetailResponse,
    feedback: Feedback
  ) => {
    setSelectedProduct(detail);
    setSelectedFeedback(feedback);
    setViewFeedbackDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - selectedImages.length);
    if (newFiles.length === 0) return;

    setSelectedImages((prev) => [...prev, ...newFiles]);

    // Create preview URLs
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitFeedback = async () => {
    if (!selectedProduct || !order) return;

    try {
      setSubmittingFeedback(true);

      // Upload images first if any
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        setUploadingImages(true);
        try {
          const uploadResult = await uploadService.uploadImage(selectedImages);
          imageUrls = uploadResult.data || [];
        } catch (error) {
          console.error("Error uploading images:", error);
          toast.error("Không thể tải lên hình ảnh");
          setUploadingImages(false);
          setSubmittingFeedback(false);
          return;
        }
        setUploadingImages(false);
      }

      await feedbackService.createFeedback({
        orderId: order.id,
        productVariantId: selectedProduct.productVariant.id,
        rating,
        comment: comment.trim() || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      });
      toast.success("Đánh giá sản phẩm thành công!");
      setFeedbackDialogOpen(false);

      // Reload feedback status
      const feedbackDetail = await feedbackService.getFeedbackDetail(
        order.id,
        selectedProduct.productVariant.id
      );
      setFeedbackStatus((prev) => ({
        ...prev,
        [selectedProduct.productVariant.id]: feedbackDetail.data,
      }));
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      const errorMsg =
        error.response?.data?.message || "Không thể gửi đánh giá";
      toast.error(errorMsg);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 ${
              star <= currentRating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : ""
            }`}
            onClick={() => interactive && setRating(star)}
          />
        ))}
      </div>
    );
  };

  const getStatusSteps = (status: OrderStatus) => {
    const steps: Array<{
      key: string;
      label: string;
      icon: typeof CheckCircle2;
      completed: boolean;
      date?: string;
      isCancelled?: boolean;
    }> = [
      {
        key: "ordered",
        label: "Đặt hàng thành công",
        icon: CheckCircle2,
        completed: true,
        date: order?.orderDate,
      },
      {
        key: "confirmed",
        label: "Đã xác nhận",
        icon: Clock,
        completed: [
          "PROCESSING",
          "READY_FOR_PICKUP",
          "SHIPPED",
          "ASSIGNED_SHIPPER",
          "DELIVERING",
          "COMPLETED",
        ].includes(status),
      },
      {
        key: "shipping",
        label: "Đang vận chuyển",
        icon: Truck,
        completed: ["DELIVERING", "COMPLETED"].includes(status),
      },
      {
        key: "completed",
        label: "Đã nhận hàng",
        icon: CheckCircle2,
        completed: status === "COMPLETED",
      },
    ];

    if (["FAILED", "CANCELED", "PAYMENT_FAILED"].includes(status)) {
      return [
        {
          key: "ordered",
          label: "Đặt hàng thành công",
          icon: CheckCircle2,
          completed: true,
          date: order?.orderDate,
        },
        {
          key: "cancelled",
          label: "Đã hủy",
          icon: XCircle,
          completed: true,
          isCancelled: true,
        },
      ] as typeof steps;
    }

    return steps;
  };

  const handleBack = () => {
    navigate(`${PUBLIC_PATH.HOME}profile/orders`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-4" />
              <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="space-y-6">
        <Alert className="bg-red-50 border-red-200">
          <AlertTitle>Có lỗi xảy ra</AlertTitle>
          <AlertDescription>
            {orderError
              ? "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau."
              : "Không tìm thấy đơn hàng."}
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách đơn hàng
        </Button>
      </div>
    );
  }

  const statusSteps = getStatusSteps(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold mb-2">Chi tiết đơn hàng</h1>
          <p className="text-gray-600">
            Mã đơn hàng: #WN0{order.id.toString().padStart(10, "0")}
          </p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      {/* Status Progress */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-6">Trạng thái đơn hàng</h3>
          <div className="flex items-center">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === statusSteps.length - 1;
              const isCancelled = "isCancelled" in step && step.isCancelled;
              return (
                <div
                  key={step.key}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div
                    className="flex flex-col items-center"
                    style={{ minWidth: "100px" }}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        step.completed
                          ? isCancelled
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-sm font-medium text-center ${
                        step.completed
                          ? isCancelled
                            ? "text-red-600"
                            : "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.date && (
                      <span className="text-xs text-gray-500 mt-1">
                        {formatDate(step.date)}
                      </span>
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`h-0.5 flex-1 mx-4 ${
                        step.completed
                          ? isCancelled
                            ? "bg-red-500"
                            : "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Sản phẩm đã đặt</h3>
              <div className="space-y-4">
                {order.orderDetails.map((detail) => (
                  <div
                    key={detail.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={
                          detail.productVariant?.productThumbnail ||
                          "https://via.placeholder.com/96x96?text=No+Image"
                        }
                        alt={detail.productVariant?.productName || "Sản phẩm"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://via.placeholder.com/96x96?text=No+Image";
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {detail.productVariant?.productName || "Sản phẩm"}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span>SKU: {detail.productVariant?.sku || "N/A"}</span>
                        {detail.productVariant?.brandName && (
                          <>
                            <span>•</span>
                            <span>{detail.productVariant.brandName}</span>
                          </>
                        )}
                        {detail.productVariant?.categoryName && (
                          <>
                            <span>•</span>
                            <span>{detail.productVariant.categoryName}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Số lượng:{" "}
                          <span className="font-semibold">
                            {detail.quantity}
                          </span>
                        </span>
                        <span className="text-gray-600">
                          Đơn giá:{" "}
                          <span className="font-semibold">
                            {formatPrice(detail.price)}
                          </span>
                        </span>
                        {detail.discount > 0 && (
                          <span className="text-green-600">
                            Giảm: -{formatPrice(detail.discount)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Final Price */}
                    <div className="text-right shrink-0">
                      <div className="font-bold text-red-600">
                        {formatPrice(detail.finalPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-2 mb-4">
                  {order.isPickup ? (
                    <Store className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <MapPin className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                  )}
                  <h3 className="font-bold text-lg">
                    {order.isPickup
                      ? "Nhận tại cửa hàng"
                      : "Thông tin giao hàng"}
                  </h3>
                </div>
                {order.isPickup ? (
                  <div className="space-y-2 text-sm">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="font-semibold text-green-800">
                        {STORE_ADDRESS}
                      </p>
                      <p className="text-green-600 text-xs mt-2">
                        Vui lòng mang theo mã đơn hàng khi đến nhận
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Người nhận:</span>
                      <p className="font-semibold">{order.receiverName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Số điện thoại:</span>
                      <p className="font-semibold">{order.receiverPhone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Địa chỉ:</span>
                      <p className="font-semibold">{order.receiverAddress}</p>
                    </div>
                  </div>
                )}
                {order.note && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-gray-600 text-sm">Ghi chú:</span>
                    <p className="text-gray-800 text-sm mt-1">{order.note}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                  <h3 className="font-bold text-lg">Phương thức thanh toán</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Phương thức:</span>
                    <p className="font-semibold">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Tóm tắt thanh toán</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số lượng sản phẩm:</span>
                  <span className="font-semibold">
                    {order.orderDetails.reduce((sum, d) => sum + d.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền hàng:</span>
                  <span className="font-semibold">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
                {order.totalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="font-semibold text-green-600">
                      -{formatPrice(order.totalDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-base">
                    <span className="font-bold">Tổng thanh toán:</span>
                    <span className="font-bold text-red-600 text-lg">
                      {formatPrice(order.finalTotalPrice)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">(Đã bao gồm VAT)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feedback Section - Only show for COMPLETED orders */}
      {order.status === "COMPLETED" && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Đánh giá sản phẩm</h3>
            <div className="space-y-4">
              {order.orderDetails.map((detail) => {
                const feedback = feedbackStatus[detail.productVariant.id];
                const isReviewed = feedback !== null && feedback !== undefined;

                return (
                  <div
                    key={detail.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={
                          detail.productVariant?.productThumbnail ||
                          "https://via.placeholder.com/64x64?text=No+Image"
                        }
                        alt={detail.productVariant?.productName || "Sản phẩm"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                        {detail.productVariant?.productName || "Sản phẩm"}
                      </h4>
                      {isReviewed && feedback && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= feedback.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(feedback.createdAt)}
                            </span>
                          </div>
                          {feedback.comment && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {feedback.comment}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                      {loadingFeedbackStatus ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      ) : isReviewed && feedback ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openViewFeedbackDialog(detail, feedback)
                          }
                          className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Xem đánh giá
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => openFeedbackDialog(detail)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Đánh giá
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đánh giá sản phẩm</DialogTitle>
            <DialogDescription>
              Chia sẻ trải nghiệm của bạn về sản phẩm này
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 py-4">
              {/* Product Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={
                      selectedProduct.productVariant?.productThumbnail ||
                      "https://via.placeholder.com/48x48?text=No+Image"
                    }
                    alt={
                      selectedProduct.productVariant?.productName || "Sản phẩm"
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                    {selectedProduct.productVariant?.productName || "Sản phẩm"}
                  </h4>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá của bạn
                </label>
                {renderStars(rating, true)}
                <p className="text-xs text-gray-500 mt-1">
                  {rating === 1 && "Rất tệ"}
                  {rating === 2 && "Tệ"}
                  {rating === 3 && "Bình thường"}
                  {rating === 4 && "Tốt"}
                  {rating === 5 && "Tuyệt vời"}
                </p>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhận xét (tùy chọn)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh (tối đa 5 ảnh)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <div className="flex flex-wrap gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative w-16 h-16">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {selectedImages.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-red-400 hover:text-red-400 transition-colors"
                    >
                      <ImagePlus className="w-5 h-5" />
                      <span className="text-[10px] mt-0.5">Thêm ảnh</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFeedbackDialogOpen(false)}
              disabled={submittingFeedback || uploadingImages}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={submittingFeedback || uploadingImages}
              className="bg-red-600 hover:bg-red-700"
            >
              {uploadingImages ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải ảnh...
                </>
              ) : submittingFeedback ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi đánh giá"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Feedback Dialog */}
      <Dialog
        open={viewFeedbackDialogOpen}
        onOpenChange={setViewFeedbackDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đánh giá của bạn</DialogTitle>
            <DialogDescription>
              Xem lại đánh giá bạn đã gửi cho sản phẩm này
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && selectedFeedback && (
            <div className="space-y-4 py-4">
              {/* Product Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={
                      selectedProduct.productVariant?.productThumbnail ||
                      "https://via.placeholder.com/48x48?text=No+Image"
                    }
                    alt={
                      selectedProduct.productVariant?.productName || "Sản phẩm"
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                    {selectedProduct.productVariant?.productName || "Sản phẩm"}
                  </h4>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá
                </label>
                <div className="flex items-center gap-2">
                  {renderStars(selectedFeedback.rating, false)}
                  <span className="text-sm text-gray-600">
                    ({selectedFeedback.rating}/5)
                  </span>
                </div>
              </div>

              {/* Comment */}
              {selectedFeedback.comment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét
                  </label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedFeedback.comment}
                  </p>
                </div>
              )}

              {/* Images */}
              {selectedFeedback.imageUrls &&
                selectedFeedback.imageUrls.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedFeedback.imageUrls.map((url, index) => (
                        <div key={index} className="w-20 h-20">
                          <img
                            src={url}
                            alt={`Feedback image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Date */}
              <div className="text-xs text-gray-500 pt-2 border-t">
                Đánh giá vào: {formatDate(selectedFeedback.createdAt)}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewFeedbackDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
