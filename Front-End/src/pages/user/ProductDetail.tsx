import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Star,
  ShoppingCart,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Shield,
  Zap,
  Truck,
  RotateCcw,
  Check,
  Send,
  Loader2,
  User,
  Home,
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

  // Auto-slide for images
  useEffect(() => {
    if (!product?.productImages || product.productImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        prev === product.productImages.length - 1 ? 0 : prev + 1
      );
    }, 3000); // Slide every 3 seconds

    return () => clearInterval(interval);
  }, [product?.productImages]);

  const handlePrevImage = useCallback(() => {
    if (!product?.productImages) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.productImages.length - 1 : prev - 1
    );
  }, [product?.productImages]);

  const handleNextImage = useCallback(() => {
    if (!product?.productImages) return;
    setCurrentImageIndex((prev) => 
      prev === product.productImages.length - 1 ? 0 : prev + 1
    );
  }, [product?.productImages]);

  // Check if a variant combination exists in database
  const isVariantCombinationAvailable = useCallback((testSelections: { [key: string]: string }) => {
    if (!product?.variants) return false;

    return product.variants.some((variant) => {
      if (!variant.productVariantValues) return false;

      const variantValues = variant.productVariantValues.map((vv) => ({
        name: vv.variantValue.variantName,
        value: vv.variantValue.value,
      }));

      return Object.keys(testSelections).every((variantName) => {
        const selectedValue = testSelections[variantName];
        if (!selectedValue) return true;

        return variantValues.some(
          (vv) => vv.name === variantName && vv.value === selectedValue
        );
      });
    });
  }, [product?.variants]);

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

  const buyNowMutation = useMutation(
    (data: { productVariantId: number; quantity: number }) =>
      cartService.addProductToCart(data),
    {
      onSuccess: () => {
        toast.success("Đã thêm vào giỏ hàng thành công!");
        // Chuyển tới trang giỏ hàng sau khi thêm thành công
        navigate(PUBLIC_PATH.CART);
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
      toast.error("Không tìm thấy sản phẩm phù hợp");
      return;
    }

    // Thêm vào giỏ hàng và chuyển tới trang giỏ hàng
    buyNowMutation.mutate({
      productVariantId: matchingVariant.id,
      quantity: 1,
    });
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
      <div className="min-h-screen bg-gray-50">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link to="/" className="hover:text-red-600 flex items-center transition-colors">
            <Home size={16} className="mr-1" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500 hover:text-red-600 cursor-pointer transition-colors">
            Sản phẩm
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium truncate">
            {product?.name}
          </span>
        </nav>

        {/* Title Section */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 flex flex-wrap items-center gap-3">
            <span>{product?.name}</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(product?.rating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-normal text-gray-500">
              {totalFeedbacks || 0} Đánh giá
            </span>
          </h1>
        </div>

        <hr className="h-[1px] w-full bg-gray-200 mb-4" />

        {/* Main Content - 2 Column Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Column - Product Images & Info */}
          <div className="flex-1 lg:sticky lg:top-[20px]">
            {/* Image Slider */}
            <div className="relative group rounded-xl border border-gray-200 shadow-lg overflow-hidden bg-white">
              <div className="h-[400px] flex items-center justify-center p-4">
                <img
                  src={
                    product?.productImages && product.productImages.length > 0
                      ? product.productImages[currentImageIndex] || product?.thumbnail
                      : product?.thumbnail
                  }
                  alt={product?.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              {product?.productImages && product.productImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                disabled={isLoadingWishlist || productId === 0}
                className={`absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  inWishlist 
                    ? "bg-red-100 text-red-600" 
                    : "bg-white/90 text-gray-600 hover:text-red-600"
                } shadow-md`}
              >
                {isLoadingWishlist ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Heart className={`w-5 h-5 ${inWishlist ? "fill-red-600" : ""}`} />
                )}
              </button>
            </div>

            {/* Thumbnail Gallery */}
            {product?.productImages && product.productImages.length > 1 && (
              <div className="pt-3 flex gap-2 overflow-x-auto no-scrollbar">
                {product.productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`shrink-0 w-[60px] h-[60px] rounded-xl border overflow-hidden transition-all ${
                      index === currentImageIndex
                        ? "border-red-500 border-2"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product?.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Product Info Grid */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Thông tin sản phẩm */}
              <div className="p-3 border-2 border-gray-200 rounded-lg bg-white">
                <h2 className="font-bold text-sm mb-3">Thông tin sản phẩm</h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2 items-start">
                    <Shield className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Hàng chính hãng - Bảo hành 24 tháng</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Giao hàng miễn phí toàn quốc</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <RotateCcw className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>Đổi trả trong 30 ngày</span>
                  </li>
                </ul>
              </div>

              {/* Thông số kỹ thuật */}
              {attributes && attributes.length > 0 && (
                <div className="p-3 border-2 border-gray-200 rounded-lg bg-white">
                  <h2 className="font-bold text-sm mb-3">Thông số kỹ thuật</h2>
                  <ul className="space-y-1.5 text-sm">
                    {attributes.slice(0, 4).map((attr) => (
                      <li key={attr.id} className="flex justify-between">
                        <span className="text-gray-500">{attr.attribute.name}:</span>
                        <span className="font-medium text-gray-900">{attr.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Purchase Options (Sticky Sidebar) */}
          <div className="basis-[400px] lg:sticky lg:top-[20px]">
            <div className="flex flex-col gap-3">
              {/* Variant Selection */}
              {Object.keys(availableVariants).length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h2 className="text-sm font-bold mb-3">Chọn phân loại sản phẩm</h2>
                  <div className="space-y-4">
                    {Object.keys(availableVariants).map((variantName) => (
                      <div key={variantName}>
                        <p className="text-xs text-gray-500 mb-2">{variantName}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {availableVariants[variantName].map((value) => {
                            const testSelections = { ...selectedVariants, [variantName]: value };
                            const isAvailable = isVariantCombinationAvailable(testSelections);
                            const isSelected = selectedVariants[variantName] === value;

                            return (
                              <button
                                key={value}
                                disabled={!isAvailable}
                                onClick={() => isAvailable && handleVariantSelection(variantName, value)}
                                className={`p-2 text-xs border rounded-lg transition-all flex items-center justify-between gap-2 ${
                                  isSelected
                                    ? "border-red-500 bg-red-50 text-red-700 font-semibold"
                                    : isAvailable
                                    ? "border-gray-200 hover:border-red-300 text-gray-700"
                                    : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 line-through"
                                }`}
                              >
                                <span className="truncate">{value}</span>
                                {isSelected && <Check className="w-4 h-4 text-red-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Box */}
              <div className="h-[60px] rounded-xl bg-[#eeeeef] flex gap-3 p-[5px]">
                <div className="text-gray-700 flex-1 gap-2 h-full flex flex-col justify-center items-center hover:bg-white rounded-lg transition-colors cursor-pointer">
                  <p className="text-xs text-gray-500">Tồn kho</p>
                  <p className="font-bold text-sm">{selectedVariant?.stock || 0} sản phẩm</p>
                </div>
                <div className="text-gray-700 flex-1 h-full flex flex-col justify-center items-center border-2 border-red-600 bg-white rounded-lg">
                  <p className="font-bold text-center text-red-600 text-lg">
                    {formatPrice(selectedVariant?.price || 0)}
                  </p>
                  {selectedVariant && selectedVariant.discount > 0 && (
                    <p className="line-through text-xs text-gray-500">
                      {formatPrice(selectedVariant.oldPrice)}
                    </p>
                  )}
                </div>
              </div>

              {/* Promotions Box */}
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <p className="bg-red-100 text-red-600 font-bold p-2 flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4" />
                  Khuyến mãi
                </p>
                <div className="p-3">
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {selectedVariant && selectedVariant.discount > 0 && (
                      <li className="text-red-600 font-bold">
                        Giảm {selectedVariant.discount}% - Tiết kiệm {formatPrice((selectedVariant.oldPrice || 0) - (selectedVariant?.price || 0))}
                      </li>
                    )}
                    <li>Nhận hàng trong 2h, miễn phí giao hàng toàn quốc</li>
                    <li className="font-medium">Bảo hành chính hãng 24 tháng</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="h-[60px] flex gap-3">
                <Button
                  onClick={handleBuyNow}
                  disabled={buyNowMutation.isLoading || addToCartMutation.isLoading || !selectedVariant || selectedVariant.stock === 0}
                  className="flex-1 bg-red-600 hover:bg-red-500 h-full rounded-lg"
                >
                  <div className="text-center">
                    {buyNowMutation.isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <>
                        <p className="font-bold text-base">Mua ngay</p>
                        <p className="text-xs opacity-90">Giao hàng trong 2h</p>
                      </>
                    )}
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isLoading || buyNowMutation.isLoading || !selectedVariant || selectedVariant.stock === 0}
                  className="h-full border-2 border-red-600 text-red-600 hover:bg-red-50 rounded-lg px-4"
                >
                  {addToCartMutation.isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="text-xs mt-1">Thêm giỏ</span>
                    </div>
                  )}
                </Button>
              </div>

              {/* More Benefits */}
              <div className="border-2 border-gray-200 overflow-hidden rounded-lg bg-white">
                <h2 className="bg-gray-100 p-2 font-bold text-sm">Ưu đãi thêm</h2>
                <ul className="p-2 space-y-1.5">
                  <li className="flex gap-2 items-start text-sm">
                    <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Tặng gói bảo hành mở rộng 12 tháng</span>
                  </li>
                  <li className="flex gap-2 items-start text-sm">
                    <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Giảm 10% khi mua phụ kiện kèm theo</span>
                  </li>
                  <li className="flex gap-2 items-start text-sm">
                    <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Hỗ trợ trả góp 0% lãi suất</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <hr className="h-[1px] w-full bg-gray-200 my-6" />

        {/* Product Description */}
        {product?.description && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6 max-w-[800px]">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-red-600" />
              Mô tả sản phẩm
            </h2>
            <div
              className="article-content text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        <hr className="h-[1px] w-full bg-gray-200 my-6" />

        {/* Product Reviews Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6 max-w-[800px]">
          <h2 className="text-lg font-bold mb-4">
            Đánh giá & nhận xét {product?.name}
          </h2>
          
          {statisticsLoading ? (
            <div className="flex flex-col sm:flex-row gap-5 pb-5 mb-5 border-b">
              <Skeleton className="h-24 w-32" />
              <Skeleton className="h-24 flex-1" />
            </div>
          ) : statistics && statistics.totalReviews > 0 ? (
            <>
              {/* Rating Summary */}
              <div className="flex flex-col sm:flex-row gap-5 pb-5 mb-5 border-b">
                {/* Average Rating */}
                <div className="sm:w-2/5 flex flex-col items-center justify-center text-center pt-4">
                  <span className="text-xl font-bold">{statistics.averageRating}/5</span>
                  <div className="flex mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(statistics.averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 mt-1">{statistics.totalReviews} đánh giá</span>
                </div>

                {/* Rating Distribution */}
                <ul className="sm:w-3/5 text-xs space-y-1">
                  {[
                    { stars: 5, count: statistics.fiveStarCount },
                    { stars: 4, count: statistics.fourStarCount },
                    { stars: 3, count: statistics.threeStarCount },
                    { stars: 2, count: statistics.twoStarCount },
                    { stars: 1, count: statistics.oneStarCount },
                  ].map(({ stars, count }) => (
                    <li key={stars} className="flex gap-1 items-center">
                      <span className="w-3">{stars}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{
                            width: `${statistics.totalReviews > 0 ? (count / statistics.totalReviews) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-gray-500">{Math.floor((count / statistics.totalReviews) * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rating Filter Tabs */}
              <div className="flex gap-2 mb-4 flex-wrap py-4 border-b">
                <p className="w-full text-sm mb-2">Bạn đánh giá sao về sản phẩm này?</p>
                <Button
                  variant={feedbackRatingFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFeedbackRatingFilter(null)}
                  className={feedbackRatingFilter === null ? "bg-red-600 hover:bg-red-700" : ""}
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
                      variant={feedbackRatingFilter === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFeedbackRatingFilter(rating)}
                      className={feedbackRatingFilter === rating ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                      {rating} <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-400" /> ({counts[rating]})
                    </Button>
                  );
                })}
              </div>

              {/* Feedbacks List */}
              {feedbacksLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 border-b">
                      <Skeleton className="h-4 w-1/4 mb-2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Star className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Không có đánh giá nào với bộ lọc này</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {feedbacks.map((feedback) => (
                    <li key={feedback.id} className="flex flex-col pb-4 mb-4 border-b last:border-0">
                      <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                          <span className="text-gray-600 font-medium text-sm">
                            {feedback.customerName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                          </span>
                        </div>

                        <div>
                          <p className="font-bold text-sm">
                            {feedback.customerName}
                            <span className="text-gray-400 text-xs ps-2 font-medium">
                              {feedback.createdAt
                                ? new Date(feedback.createdAt).toLocaleDateString("vi-VN")
                                : ""}
                            </span>
                          </p>
                          <div className="flex gap-2 text-green-600 text-xs">
                            <Check className="w-3 h-3" />
                            <span>Đã mua tại Shopify</span>
                          </div>
                        </div>
                      </div>
                      <div className="ms-11">
                        <div className="flex mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= feedback.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        {feedback.comment && (
                          <p className="text-sm text-gray-700 mt-1">{feedback.comment}</p>
                        )}
                        {feedback.imageUrls && feedback.imageUrls.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {feedback.imageUrls.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Review ${index + 1}`}
                                className="w-14 h-14 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                onClick={() => window.open(url, "_blank")}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Star className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Chưa có đánh giá nào về sản phẩm này</p>
              <p className="text-xs">Hãy mua sản phẩm và trở thành người đầu tiên đánh giá!</p>
            </div>
          )}
        </div>

        <hr className="h-[1px] w-full bg-gray-200 my-6" />

        {/* Product Questions Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6 max-w-[800px]">
          <h2 className="text-lg font-bold mb-4">Hỏi và đáp</h2>
          
          {/* Question Input Form */}
          <div className="mb-4">
            <textarea
              value={questionContent}
              onChange={(e) => setQuestionContent(e.target.value)}
              placeholder="Viết câu hỏi của bạn tại đây..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
              rows={3}
            />
            <Button
              onClick={handleSubmitQuestion}
              disabled={createQuestionMutation.isLoading || !questionContent.trim()}
              className="bg-red-600 hover:bg-red-700 text-white w-full mt-3"
            >
              {createQuestionMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Gửi câu hỏi
                </>
              )}
            </Button>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {questionsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 border-b">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : allQuestions.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Chưa có câu hỏi nào về sản phẩm này</p>
                <p className="text-xs">Hãy là người đầu tiên đặt câu hỏi!</p>
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
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}
