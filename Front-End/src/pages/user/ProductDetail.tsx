import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Star,
  ShoppingCart,
  MessageCircle,
  Settings,
  ChevronRight,
  Shield,
  Truck,
  RotateCcw,
  Check,
  GitCompareArrows,
  Send,
  Loader2,
  User,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { cartService } from "@/services/cart.service";
import { productService } from "@/services/product.service";
import { productQuestionService } from "@/services/productQuestion.service";
import { feedbackService } from "@/services/feedback.service";
import { PUBLIC_PATH } from "@/constants/path";
import type { Product, ProductVariantResponse } from "@/types/product.type";
import type { Feedback, RatingStatistics } from "@/types/feedback.type";
import { toast } from "sonner";
import LoginModal from "@/components/user/LoginModal";
import QuestionItem from "@/components/user/QuestionItem";
import QuestionPagination from "@/components/user/QuestionPagination";
import { useQuery } from "@/hooks/useQuery";
import { useMutation } from "@/hooks/useMutation";
import { useWishlist } from "@/hooks/useWishlist";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { isInWishlist, toggleWishlist, isAdding, isRemoving } = useWishlist();
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantResponse | null>(null);
  // Dynamic state for attributes and variants
  const [attributes, setAttributes] = useState<any[]>([]);
  const [availableVariants, setAvailableVariants] = useState<{
    [key: string]: string[];
  }>({});
  const [selectedVariants, setSelectedVariants] = useState<{
    [key: string]: string;
  }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [questionContent, setQuestionContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState<
    number | null
  >(null);
  const pageSize = 5;

  // Extract variants from API data dynamically
  const extractVariantsFromProduct = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return;

    const variantGroups: { [key: string]: Set<string> } = {};
    const defaultSelections: { [key: string]: string } = {};

    product.variants.forEach((variant) => {
      if (variant.productVariantValues) {
        variant.productVariantValues.forEach((variantValue) => {
          const { value } = variantValue.variantValue;
          const variantName =
            variantValue.variantValue.variantName || "Mặc định";

          if (!variantGroups[variantName]) {
            variantGroups[variantName] = new Set();
          }
          variantGroups[variantName].add(value);
        });
      }
    });

    // Convert Sets to Arrays and set defaults
    const availableVariants: { [key: string]: string[] } = {};
    Object.keys(variantGroups).forEach((variantName) => {
      availableVariants[variantName] = Array.from(variantGroups[variantName]);
      defaultSelections[variantName] = availableVariants[variantName][0];
    });

    setAvailableVariants(availableVariants);
    setSelectedVariants(defaultSelections);
  };

  // Load product data from API
  const {
    data: productData,
    isLoading: loading,
    error,
  } = useQuery<{ status: number; data: Product }>(
    () => productService.getProductBySlug(slug!),
    {
      queryKey: ["product", slug || ""],
      enabled: !!slug,
      onError: (err) => {
        console.error("Error loading product:", err);
      },
    }
  );

  const product = productData?.data || null;

  // Load product questions
  const {
    data: questionsData,
    isLoading: questionsLoading,
    refetch: refetchQuestions,
  } = useQuery(
    () =>
      productQuestionService.getProductQuestionsBySlug(
        slug!,
        currentPage,
        pageSize
      ),
    {
      queryKey: ["product-questions", slug || "", currentPage.toString()],
      enabled: !!slug,
      onError: (err) => {
        console.error("Error loading product questions:", err);
      },
    }
  );

  const totalPages = questionsData?.data?.totalPage || 1;
  const totalItems = questionsData?.data?.totalItem || 0;

  // Load product feedbacks
  const { data: feedbacksData, isLoading: feedbacksLoading } = useQuery(
    () =>
      feedbackService.getFeedbacksByProduct(
        product?.id || 0,
        1,
        5,
        feedbackRatingFilter || undefined
      ),
    {
      queryKey: [
        "product-feedbacks",
        product?.id?.toString() || "",
        feedbackRatingFilter?.toString() || "all",
      ],
      enabled: !!product?.id,
      onError: (err) => {
        console.error("Error loading product feedbacks:", err);
      },
    }
  );

  // Load rating statistics
  const { data: statisticsData, isLoading: statisticsLoading } = useQuery(
    () => feedbackService.getRatingStatistics(product?.id || 0),
    {
      queryKey: ["product-statistics", product?.id?.toString() || ""],
      enabled: !!product?.id,
      onError: (err) => {
        console.error("Error loading rating statistics:", err);
      },
    }
  );

  const feedbacks: Feedback[] = feedbacksData?.data?.content || [];
  const totalFeedbacks = feedbacksData?.data?.totalElements || 0;
  const statistics: RatingStatistics | null = statisticsData?.data || null;

  // Cập nhật danh sách câu hỏi khi load thêm
  useEffect(() => {
    if (questionsData?.data?.data) {
      const newQuestions = questionsData.data.data;
      if (currentPage === 1) {
        setAllQuestions(newQuestions);
      } else {
        setAllQuestions((prev) => [...prev, ...newQuestions]);
      }
    }
  }, [questionsData, currentPage]);

  useEffect(() => {
    if (product) {
      setAttributes(product.attributes || []);

      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
        extractVariantsFromProduct(product);
      }
    }
  }, [product?.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Find matching variant based on selections
  const findMatchingVariant = () => {
    if (!product?.variants) return null;

    return product.variants.find((variant) => {
      if (!variant.productVariantValues) return false;

      // Get all variant values for this variant
      const variantValues = variant.productVariantValues.map((vv) => ({
        name: vv.variantValue.variantName,
        value: vv.variantValue.value,
      }));

      // Check if all selected variants match this variant
      return Object.keys(selectedVariants).every((variantName) => {
        const selectedValue = selectedVariants[variantName];
        if (!selectedValue) return true;

        return variantValues.some(
          (vv) => vv.name === variantName && vv.value === selectedValue
        );
      });
    });
  };

  // Update selected variant when selections change
  useEffect(() => {
    if (!product) return;
    const matchingVariant = findMatchingVariant();
    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariants, product?.id]);

  const addToCartMutation = useMutation(
    (data: { productVariantId: number; quantity: number }) =>
      cartService.addProductToCart(data),
    {
      onSuccess: () => {
        toast.success("Đã thêm vào giỏ hàng thành công!");
      },
      onError: () => {
        toast.error("Không thể thêm vào giỏ hàng");
      },
    }
  );

  const createQuestionMutation = useMutation(
    (data: { content: string; productId: number }) =>
      productQuestionService.createProductQuestion(data),
    {
      onSuccess: () => {
        toast.success("Câu hỏi đã được gửi thành công!");
        setQuestionContent("");
        setAllQuestions([]); // Reset danh sách câu hỏi
        setCurrentPage(1); // Reset về trang đầu khi thêm câu hỏi mới
        refetchQuestions();
      },
      onError: () => {
        toast.error("Không thể gửi câu hỏi");
      },
    }
  );

  const createAnswerMutation = useMutation(
    (data: { content: string; productQuestionId: number }) =>
      productQuestionService.createProductQuestionAnswer(data),
    {
      onSuccess: () => {
        toast.success("Trả lời đã được gửi thành công!");
        setAllQuestions([]); // Reset danh sách câu hỏi
        setCurrentPage(1); // Reset về trang đầu khi thêm câu trả lời mới
        refetchQuestions();
      },
      onError: () => {
        toast.error("Không thể gửi trả lời");
      },
    }
  );

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Find the matching variant based on current selections
    const matchingVariant = findMatchingVariant();

    if (!matchingVariant) {
      console.error("Không tìm thấy variant phù hợp với lựa chọn hiện tại");
      toast.error("Không tìm thấy sản phẩm phù hợp");
      return;
    }

    console.log("Selected variants:", selectedVariants);
    console.log("Matching variant ID:", matchingVariant.id);

    await addToCartMutation.mutate({
      productVariantId: matchingVariant.id,
      quantity: 1,
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Find the matching variant based on current selections
    const matchingVariant = findMatchingVariant();

    if (!matchingVariant) {
      console.error("Không tìm thấy variant phù hợp với lựa chọn hiện tại");
      return;
    }

    console.log("Buy now - Selected variants:", selectedVariants);
    console.log("Buy now - Matching variant ID:", matchingVariant.id);

    // Logic mua ngay - có thể lưu variant ID vào state hoặc localStorage
    navigate(`${PUBLIC_PATH.HOME}checkout`);
  };

  const handleSubmitQuestion = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!questionContent.trim()) {
      toast.error("Vui lòng nhập câu hỏi");
      return;
    }

    if (!product?.id) {
      toast.error("Không tìm thấy thông tin sản phẩm");
      return;
    }

    await createQuestionMutation.mutate({
      content: questionContent.trim(),
      productId: product.id,
    });
  };

  const handleAnswerSubmit = async (questionId: number, content: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!content.trim()) {
      toast.error("Vui lòng nhập câu trả lời");
      return;
    }

    await createAnswerMutation.mutate({
      content: content.trim(),
      productQuestionId: questionId,
    });
  };

  // Handle variant selection
  const handleVariantSelection = (variantName: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: value,
    }));
  };

  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (product?.id) {
      toggleWishlist(product.id);
    }
  };

  // Get current product ID for wishlist check
  const productId = product?.id || 0;
  const inWishlist = productId > 0 ? isInWishlist(productId) : false;
  const isLoadingWishlist = isAdding || isRemoving;

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24" />
                ))}
              </div>
              <Skeleton className="h-64 w-full rounded-lg" />
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-20 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-1/2 mb-4" />
                  <Skeleton className="h-12 w-3/4" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Không tìm thấy sản phẩm
            </h2>
            <p className="text-gray-600 mb-6">
              Sản phẩm có thể đã bị xóa hoặc không tồn tại
            </p>
            <Button
              onClick={() => navigate(PUBLIC_PATH.HOME)}
              className="w-full"
            >
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              to={PUBLIC_PATH.HOME}
              className="text-gray-500 hover:text-red-600 transition-colors"
            >
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 hover:text-red-600 cursor-pointer transition-colors">
              Laptop
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 hover:text-red-600 cursor-pointer transition-colors">
              ASUS
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Product Title & Rating */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {product.name}
          </h1>
          <div className="flex items-center gap-6 text-sm">
            {/* Rating */}
            {statistics && statistics.totalReviews > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-semibold text-gray-900">
                    {statistics.averageRating}
                  </span>
                </div>
                <span className="text-blue-600 hover:underline cursor-pointer">
                  ({statistics.totalReviews} đánh giá)
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleWishlistToggle}
                disabled={isLoadingWishlist || productId === 0}
                className={`flex items-center gap-1 transition-colors ${
                  inWishlist
                    ? "text-red-500"
                    : "text-gray-600 hover:text-red-500"
                } ${
                  isLoadingWishlist ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoadingWishlist ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart
                    className={`w-4 h-4 ${inWishlist ? "fill-red-500" : ""}`}
                  />
                )}
                <span>Yêu thích</span>
              </button>

              <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                <GitCompareArrows className="w-4 h-4" />
                <span>So sánh</span>
              </button>

              <a
                href="#questions"
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hỏi đáp</span>
              </a>

              <a
                href="#specifications"
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Thông số</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Column - Product Images */}
          <div className="flex-1 lg:sticky lg:top-4">
            {/* Main Image with Slider */}
            <Card className="overflow-hidden mb-4">
              <CardContent className="p-0">
                <div className="relative aspect-square bg-gradient-to-br from-pink-100 via-orange-50 to-white flex items-center justify-center p-8">
                  <img
                    src={
                      product.productImages[currentImageIndex] ||
                      product.thumbnail
                    }
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                  {selectedVariant && selectedVariant.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md font-bold text-sm">
                      Giảm {selectedVariant.discount}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail Gallery */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.productImages.map((image, index) => (
                <button
                  key={index}
                  className={`relative shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                    index === currentImageIndex
                      ? "ring-2 ring-red-500 ring-offset-2"
                      : "ring-1 ring-gray-200 hover:ring-gray-300"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-12 h-12 object-cover"
                  />
                  {index === currentImageIndex && (
                    <div className="absolute inset-0 bg-red-600/10"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Product Info Cards */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm mb-3">Thông tin sản phẩm</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Nguyên hộp, đầy đủ phụ kiện</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>Bảo hành 12 tháng</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Truck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span>Giao hàng miễn phí</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <RotateCcw className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>1 đổi 1 trong 30 ngày</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm mb-3">
                    Có {product.variants?.length || 0} phiên bản
                  </h3>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>✓ Tất cả các phiên bản đều có sẵn</p>
                    <p>✓ Giao hàng nhanh trong 2h</p>
                    <p>✓ Nhận tại cửa hàng</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Purchase Options */}
          <div className="basis-[400px] lg:sticky lg:top-4">
            <div className="space-y-4">
              {/* Variant Selection */}
              {Object.keys(availableVariants).length > 0 && (
                <div>
                  <h2 className="text-sm font-bold mb-3">
                    Chọn màu để xem giá và chi tiết
                  </h2>
                  <div className="space-y-3">
                    {Object.keys(availableVariants).map((variantName) => (
                      <div key={variantName}>
                        <p className="text-xs text-gray-600 mb-2 uppercase font-semibold">
                          {variantName}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {availableVariants[variantName].map((value) => (
                            <button
                              key={value}
                              className={`flex gap-2 items-center justify-center p-2 border rounded-lg transition-all ${
                                selectedVariants[variantName] === value
                                  ? "border-red-600 bg-red-50"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                              onClick={() =>
                                handleVariantSelection(variantName, value)
                              }
                            >
                              <div className="text-[10.5px] text-start">
                                <p
                                  className={`font-bold text-xs ${
                                    selectedVariants[variantName] === value
                                      ? "text-red-600"
                                      : ""
                                  }`}
                                >
                                  {value}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Display */}
              <div className="h-[60px] rounded-xl bg-gray-100 flex gap-3 p-[5px]">
                <div className="text-gray-700 flex-1 gap-2 h-full flex justify-center items-center hover:bg-white rounded-lg transition-colors cursor-pointer">
                  <RotateCcw className="w-6 h-6" />
                  <div>
                    <p className="font-bold text-center text-sm">Thu cũ đổi mới</p>
                    <p className="text-xs">Giá tốt hơn</p>
                  </div>
                </div>
                <div className="text-gray-700 flex-1 h-full flex flex-col justify-center items-center border-2 border-red-600 bg-white rounded-lg">
                  <p className="font-bold text-center text-red-600">
                    {formatPrice(selectedVariant?.price || 0)}
                  </p>
                  {selectedVariant && selectedVariant.discount > 0 && (
                    <p className="line-through text-xs text-gray-400">
                      {formatPrice(selectedVariant.oldPrice)}
                    </p>
                  )}
                </div>
              </div>

              {/* Promotions */}
              <Card className="border border-red-200">
                <CardContent className="p-0">
                  <div className="bg-red-50 text-red-600 font-bold p-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Khuyến mãi hấp dẫn
                  </div>
                  <div className="p-3">
                    <ul className="text-sm space-y-2">
                      {selectedVariant && selectedVariant.discount > 0 && (
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <span>
                            <span className="text-red-600 font-bold">
                              Giảm {selectedVariant.discount}%
                            </span>{" "}
                            - Tiết kiệm{" "}
                            {formatPrice(
                              selectedVariant.oldPrice -
                                (selectedVariant?.price || 0)
                            )}
                          </span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span className="font-bold">
                          Nhận hàng trong 2h, miễn phí giao hàng toàn quốc
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span>
                          Trả góp 0% lãi suất, tối đa 12 tháng, trả trước từ 10%
                          qua CTTC hoặc 0đ qua thẻ tín dụng
                        </span>
                      </li>
                    </ul>
                    <p className="text-red-600 text-sm font-bold bg-red-50 py-2 px-3 my-3 rounded-lg text-center">
                      LIÊN HỆ HOTLINE 1800.2097 ĐỂ ĐƯỢC GIÁ ĐẶC BIỆT
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="h-[60px] flex gap-4">
                <Button
                  className="flex-1 bg-red-600 h-full hover:bg-red-500"
                  onClick={handleBuyNow}
                >
                  <div className="text-center">
                    <p className="font-bold text-base">Mua ngay</p>
                    <p className="text-xs">Giao hàng trong 2h hoặc nhận tại cửa hàng</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-full basis-[60px] px-0 flex-grow-0 flex-shrink-0 border-2 border-red-600 hover:border-red-500 hover:bg-red-50"
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isLoading}
                >
                  <div>
                    {addToCartMutation.isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-red-600 mx-auto" />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-red-600 mx-auto" />
                    )}
                    <p className="text-[8.5px] text-red-600 mt-1">Thêm vào giỏ</p>
                  </div>
                </Button>
              </div>

              {/* More Offers */}
              <Card className="border-2 border-gray-200">
                <CardContent className="p-0">
                  <h2 className="bg-gray-100 p-3 font-bold text-sm">Ưu đãi thêm</h2>
                  <ul className="divide-y">
                    <li className="py-2 px-3 flex gap-2 items-start text-sm hover:bg-gray-50 transition-colors">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Giảm thêm 5% (tối đa 200.000đ) khi thu cũ lên đời</span>
                    </li>
                    <li className="py-2 px-3 flex gap-2 items-start text-sm hover:bg-gray-50 transition-colors">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span>
                        Hoàn tiền đến 2 triệu khi mở thẻ tín dụng HSBC
                      </span>
                    </li>
                    <li className="py-2 px-3 flex gap-2 items-start text-sm hover:bg-gray-50 transition-colors">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span>Giảm ngay 700K khi trả góp qua thẻ tín dụng TECHCOMBANK</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Product Description & Commitments */}
        {product.description && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Mô tả sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </CardContent>
          </Card>
        )}

        {/* Dynamic Technical Specifications */}
        <Card className="mt-8" id="specifications">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Settings className="w-6 h-6 text-blue-600" />
                Thông số kỹ thuật
              </CardTitle>
              <Button
                variant="ghost"
                size="lg"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {attributes
                  .slice(0, Math.ceil(attributes.length / 2))
                  .map((attr, index) => (
                    <div
                      key={index}
                      className="flex group hover:bg-gray-50 transition-colors rounded-lg"
                    >
                      <div className="w-1/3 bg-linear-to-r from-gray-100 to-gray-50 p-4 font-semibold text-gray-700 border-r border-gray-200 rounded-l-lg">
                        {attr.attribute.name}
                      </div>
                      <div className="w-2/3 bg-white p-4 text-gray-900 font-medium rounded-r-lg">
                        {attr.value}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="space-y-4">
                {attributes
                  .slice(Math.ceil(attributes.length / 2))
                  .map((attr, index) => (
                    <div
                      key={index}
                      className="flex group hover:bg-gray-50 transition-colors rounded-lg"
                    >
                      <div className="w-1/3 bg-linear-to-r from-gray-100 to-gray-50 p-4 font-semibold text-gray-700 border-r border-gray-200 rounded-l-lg">
                        {attr.attribute.name}
                      </div>
                      <div className="w-2/3 bg-white p-4 text-gray-900 font-medium rounded-r-lg">
                        {attr.value}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Reviews Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Đánh giá & nhận xét {product.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statisticsLoading ? (
              <div className="flex gap-8 mb-6">
                <Skeleton className="h-32 w-48" />
                <Skeleton className="h-32 flex-1" />
              </div>
            ) : statistics && statistics.totalReviews > 0 ? (
              <>
                {/* Rating Summary */}
                <div className="flex gap-8 mb-6 p-6 bg-gray-50 rounded-lg">
                  {/* Average Rating */}
                  <div className="text-center">
                    <div className="text-5xl font-bold text-red-600">
                      {statistics.averageRating}
                    </div>
                    <div className="flex justify-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(statistics.averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {statistics.totalReviews} đánh giá
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="flex-1 space-y-2">
                    {[
                      { stars: 5, count: statistics.fiveStarCount },
                      { stars: 4, count: statistics.fourStarCount },
                      { stars: 3, count: statistics.threeStarCount },
                      { stars: 2, count: statistics.twoStarCount },
                      { stars: 1, count: statistics.oneStarCount },
                    ].map(({ stars, count }) => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="w-12 text-sm text-gray-600">
                          {stars} sao
                        </span>
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full transition-all"
                            style={{
                              width: `${
                                statistics.totalReviews > 0
                                  ? (count / statistics.totalReviews) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="w-10 text-sm text-gray-500 text-right">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating Filter Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  <Button
                    variant={
                      feedbackRatingFilter === null ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setFeedbackRatingFilter(null)}
                    className={
                      feedbackRatingFilter === null
                        ? "bg-red-600 hover:bg-red-700"
                        : ""
                    }
                  >
                    Tất cả ({statistics.totalReviews})
                  </Button>
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const counts: Record<number, number> = {
                      5: statistics.fiveStarCount,
                      4: statistics.fourStarCount,
                      3: statistics.threeStarCount,
                      2: statistics.twoStarCount,
                      1: statistics.oneStarCount,
                    };
                    return (
                      <Button
                        key={rating}
                        variant={
                          feedbackRatingFilter === rating
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setFeedbackRatingFilter(rating)}
                        className={
                          feedbackRatingFilter === rating
                            ? "bg-red-600 hover:bg-red-700"
                            : ""
                        }
                      >
                        {rating}{" "}
                        <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-400" />{" "}
                        ({counts[rating]})
                      </Button>
                    );
                  })}
                </div>

                {/* Feedbacks List */}
                {feedbacksLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <Skeleton className="h-4 w-1/4 mb-2" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Không có đánh giá nào với bộ lọc này</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="p-4 border rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <span className="text-red-600 font-semibold text-lg">
                              {feedback.customerName
                                ?.charAt(0)
                                ?.toUpperCase() || <User className="w-5 h-5" />}
                            </span>
                          </div>

                          <div className="flex-1">
                            {/* Name and Rating */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800">
                                {feedback.customerName}
                              </span>
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
                            </div>

                            {/* Date */}
                            <div className="text-xs text-gray-500 mb-2">
                              {feedback.createdAt
                                ? new Date(
                                    feedback.createdAt
                                  ).toLocaleDateString("vi-VN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : ""}
                            </div>

                            {/* Comment */}
                            {feedback.comment && (
                              <p className="text-gray-700 mb-2">
                                {feedback.comment}
                              </p>
                            )}

                            {/* Images */}
                            {feedback.imageUrls &&
                              feedback.imageUrls.length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                  {feedback.imageUrls.map((url, index) => (
                                    <img
                                      key={index}
                                      src={url}
                                      alt={`Review image ${index + 1}`}
                                      className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => window.open(url, "_blank")}
                                    />
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* View All Button */}
                    {totalFeedbacks > 5 && (
                      <div className="text-center pt-4">
                        <Link to={`${PUBLIC_PATH.HOME}product/${slug}/reviews`}>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Xem tất cả {totalFeedbacks} đánh giá
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có đánh giá nào về sản phẩm này</p>
                <p className="text-sm">
                  Hãy mua sản phẩm và trở thành người đầu tiên đánh giá!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Questions Section */}
        <Card className="mt-8" id="questions">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Hỏi và đáp
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Introduction Section with Mascot */}
            <div className="mb-6 p-6 bg-linear-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
              <div className="flex items-start gap-4">
                {/* Mascot Icon */}
                <div className="shrink-0">
                  <img
                    src="/assets/bee.png"
                    alt="CellphoneS Mascot"
                    className="w-20 h-20 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Hãy đặt câu hỏi cho chúng tôi
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    CellphoneS sẽ phản hồi trong vòng 1 giờ. Nếu Quý khách gửi
                    câu hỏi sau 22h, chúng tôi sẽ trả lời vào sáng hôm sau.
                    Thông tin có thể thay đổi theo thời gian, vui lòng đặt câu
                    hỏi để nhận được cập nhật mới nhất!
                  </p>
                </div>
              </div>

              {/* Question Input Form */}
              <div className="mt-4 flex gap-3">
                <textarea
                  value={questionContent}
                  onChange={(e) => setQuestionContent(e.target.value)}
                  placeholder="Viết câu hỏi của bạn tại đây"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                  rows={3}
                />
                <Button
                  onClick={handleSubmitQuestion}
                  disabled={
                    createQuestionMutation.isLoading || !questionContent.trim()
                  }
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 h-auto self-end"
                >
                  {createQuestionMutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      Gửi câu hỏi
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questionsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : allQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có câu hỏi nào về sản phẩm này</p>
                  <p className="text-sm">Hãy là người đầu tiên đặt câu hỏi!</p>
                </div>
              ) : (
                <>
                  {allQuestions.map((question) => (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      onAnswerSubmit={handleAnswerSubmit}
                      isAnswering={createAnswerMutation.isLoading}
                    />
                  ))}

                  {/* Load More Button */}
                  <QuestionPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    currentItems={allQuestions.length}
                    onLoadMore={() => setCurrentPage(currentPage + 1)}
                    isLoading={questionsLoading}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}
