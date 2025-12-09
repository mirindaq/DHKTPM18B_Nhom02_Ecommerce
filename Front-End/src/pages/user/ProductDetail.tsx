import { useState, useEffect } from "react";
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
  Shield,
  Truck,
  RotateCcw,
  Check,
  Send,
  Loader2,
  User,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { cartService } from "@/services/cart.service";
import { productService } from "@/services/product.service";
import { productQuestionService } from "@/services/productQuestion.service";
import { feedbackService } from "@/services/feedback.service";
import { categoryService } from "@/services/category.service";
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
import Breadcrumb from "@/components/user/search/Breadcrumb";
import { articleService } from "@/services/article.service";
import type { Article } from "@/types/article.type";
import ProductCard from "@/components/user/ProductCard";
import ProductRelatedArticles from "@/components/user/product/ProductRelatedArticles";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { isInWishlist, toggleWishlist, isAdding, isRemoving } = useWishlist();
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantResponse | null>(null);
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

  // Load category to get slug
  const { data: categoryData } = useQuery(
    () => categoryService.getCategoryById(product?.categoryId || 0),
    {
      queryKey: ["category", product?.categoryId?.toString() || ""],
      enabled: !!product?.categoryId,
      onError: (err) => {
        console.error("Error loading category:", err);
      },
    }
  );

  const categorySlug = categoryData?.data?.slug || "";

  // Load related products (same category)
  const { data: relatedProductsData, isLoading: relatedProductsLoading } = useQuery(
    () => productService.getProducts(1, 5, { categoryId: product?.categoryId || null }),
    {
      queryKey: ["related-products", product?.categoryId?.toString() || ""],
      enabled: !!product?.categoryId,
      onError: (err) => {
        console.error("Error loading related products:", err);
      },
    }
  );

  const relatedProducts: Product[] = (relatedProductsData?.data?.data || []).filter(
    (p) => p.id !== product?.id
  ).slice(0, 5);

  // Load related articles
  const { data: relatedArticlesData, isLoading: relatedArticlesLoading } = useQuery(
    () => articleService.getArticles(1, 4, "", null, null),
    {
      queryKey: ["related-articles"],
      onError: (err) => {
        console.error("Error loading related articles:", err);
      },
    }
  );

  const relatedArticles: Article[] = (relatedArticlesData?.data?.data || []).slice(0, 4);

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

      const variantValues = variant.productVariantValues.map((vv) => ({
        name: vv.variantValue.variantName,
        value: vv.variantValue.value,
      }));

      return Object.keys(selectedVariants).every((variantName) => {
        const selectedValue = selectedVariants[variantName];
        if (!selectedValue) return true;

        return variantValues.some(
          (vv) => vv.name === variantName && vv.value === selectedValue
        );
      });
    });
  };

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
        setAllQuestions([]);
        setCurrentPage(1);
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
        setAllQuestions([]);
        setCurrentPage(1);
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

    const matchingVariant = findMatchingVariant();

    if (!matchingVariant) {
      toast.error("Không tìm thấy sản phẩm phù hợp");
      return;
    }

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

    const matchingVariant = findMatchingVariant();

    if (!matchingVariant) {
      toast.error("Không tìm thấy sản phẩm phù hợp");
      return;
    }

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

  const handleVariantSelection = (variantName: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: value,
    }));
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (product?.id) {
      toggleWishlist(product.id);
    }
  };

  const productId = product?.id || 0;
  const inWishlist = productId > 0 ? isInWishlist(productId) : false;
  const isLoadingWishlist = isAdding || isRemoving;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
            <div className="space-y-6">
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-1/2 mb-4" />
                  <Skeleton className="h-12 w-3/4" />
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
        <Card className="w-full max-w-md mx-4 border border-gray-200">
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
              className="w-full bg-red-600 hover:bg-red-700"
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
      <div className="max-w-7xl mx-auto px-4 py-2">
        <Breadcrumb
          items={[
            { label: "Sản phẩm" },
            { label: product?.name || "Chi tiết sản phẩm" },
          ]}
        />

        {/* Section 1: Banner + Thông số kỹ thuật bên trái, Giá + Biến thể + Mua hàng bên phải */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
          {/* Product Title */}
          <div className="">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {product?.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <button
                onClick={handleWishlistToggle}
                disabled={isLoadingWishlist || productId === 0}
                className={`flex items-center gap-1.5 transition-colors ${
                  inWishlist ? "text-red-600" : "text-gray-600 hover:text-red-600"
                } ${
                  isLoadingWishlist
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                {isLoadingWishlist ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart
                    className={`w-4 h-4 ${
                      inWishlist ? "fill-red-600 text-red-600" : ""
                    }`}
                  />
                )}
                <span>Yêu thích</span>
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('reviews');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
              >
                <Star className="w-4 h-4" />
                <span>Đánh giá</span>
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('questions');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Câu hỏi</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Banner + Thông số kỹ thuật */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Product Image */}
              <div className="relative rounded-xl overflow-hidden bg-gray-50 h-[420px] flex items-center justify-center">
                <img
                  src={
                    product?.productImages && product.productImages.length > 0
                      ? product.productImages[currentImageIndex] || product?.thumbnail
                      : product?.thumbnail
                  }
                  alt={product?.name}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              </div>

              {/* Image Gallery */}
              {product?.productImages && product.productImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-red-600 ring-2 ring-red-200"
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

              {/* Technical Specifications */}
              {attributes.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Thông số kỹ thuật</h2>
                      <p className="text-sm text-gray-500">Chi tiết cấu hình sản phẩm</p>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        {attributes.map((attr, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                          >
                            <td className="w-1/3 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 border-r border-gray-200">
                              {attr.attribute.name}
                            </td>
                            <td className="w-2/3 px-4 py-3 text-sm text-gray-900 font-medium">
                              {attr.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Giá + Biến thể + Mua hàng */}
            <div className="lg:col-span-5 space-y-6">
              {/* Price Section */}
              <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-red-600">
                    {formatPrice(selectedVariant?.price || 0)}
                  </span>
                  {selectedVariant && selectedVariant.discount > 0 && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(selectedVariant.oldPrice)}
                    </span>
                  )}
                </div>
                {selectedVariant && selectedVariant.discount > 0 && (
                  <div className="text-sm text-gray-600">
                    Tiết kiệm:{" "}
                    <span className="font-semibold text-green-700">
                      {formatPrice(
                        (selectedVariant.oldPrice || 0) - (selectedVariant?.price || 0)
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Variant Selection */}
              {Object.keys(availableVariants).length > 0 && (
                <div className="space-y-4">
                  {Object.keys(availableVariants).map((variantName) => (
                    <div key={variantName} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {variantName}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const defaultSelections: { [key: string]: string } = {};
                            Object.keys(availableVariants).forEach((name) => {
                              defaultSelections[name] = availableVariants[name][0];
                            });
                            setSelectedVariants(defaultSelections);
                          }}
                          className="h-auto p-0 text-xs text-gray-500 hover:text-red-600"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Đặt lại
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableVariants[variantName].map((value) => (
                          <button
                            key={value}
                            onClick={() => handleVariantSelection(variantName, value)}
                            className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                              selectedVariants[variantName] === value
                                ? "border-red-600 bg-red-50 text-red-700 font-medium"
                                : "border-gray-200 hover:border-red-300 hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleBuyNow}
                  disabled={buyNowMutation.isLoading || addToCartMutation.isLoading}
                  className="h-14 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
                >
                  {buyNowMutation.isLoading || addToCartMutation.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Đang thêm...
                    </>
                  ) : (
                    "Mua ngay"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isLoading}
                  className="h-14 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-semibold rounded-xl"
                >
                  {addToCartMutation.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Thêm vào giỏ
                    </>
                  )}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">Chính hãng</p>
                    <p className="text-xs text-gray-600">100%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">Bảo hành</p>
                    <p className="text-xs text-gray-600">24 tháng</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">Giao hàng</p>
                    <p className="text-xs text-gray-600">Miễn phí</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">Đổi trả</p>
                    <p className="text-xs text-gray-600">30 ngày</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Sản phẩm tương tự */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Sản phẩm tương tự</h2>
                  <p className="text-sm text-gray-500">Có thể bạn cũng thích</p>
                </div>
              </div>
              {relatedProducts.length >= 5 && categorySlug && (
                <Link to={`${PUBLIC_PATH.HOME}search/${categorySlug}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Xem thêm <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
            {relatedProductsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section 3: Chi tiết bên trái, Tin tức bên phải */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left - Product Description */}
          <div className="lg:col-span-2">
            {product?.description && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Mô tả sản phẩm</h2>
                  </div>
                </div>
                <div
                  className="article-content prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>

          {/* Right - Related Articles */}
          <div className="lg:col-span-1">
            <ProductRelatedArticles articles={relatedArticles} isLoading={relatedArticlesLoading} />
          </div>
        </div>

        {/* Product Reviews Section */}
        <div id="reviews" className="bg-white rounded-xl p-6 mb-6 border border-gray-200 scroll-mt-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Đánh giá & nhận xét</h2>
              <p className="text-sm text-gray-500">
                {statistics?.totalReviews || 0} đánh giá từ khách hàng
              </p>
            </div>
          </div>

          {statisticsLoading ? (
            <div className="flex gap-8 mb-6">
              <Skeleton className="h-32 w-48" />
              <Skeleton className="h-32 flex-1" />
            </div>
          ) : statistics && statistics.totalReviews > 0 ? (
            <>
              {/* Rating Summary */}
              <div className="flex gap-8 mb-6 p-6 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="text-5xl font-bold text-red-600">
                    {statistics.averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mt-2 gap-1">
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

                <div className="flex-1 space-y-2">
                  {[
                    { stars: 5, count: statistics.fiveStarCount },
                    { stars: 4, count: statistics.fourStarCount },
                    { stars: 3, count: statistics.threeStarCount },
                    { stars: 2, count: statistics.twoStarCount },
                    { stars: 1, count: statistics.oneStarCount },
                  ].map(({ stars, count }) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-12 text-sm text-gray-600">{stars} sao</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
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

              {/* Rating Filter */}
              <div className="flex gap-2 mb-6 flex-wrap">
                <Button
                  variant={feedbackRatingFilter === null ? "default" : "outline"}
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
                        feedbackRatingFilter === rating ? "default" : "outline"
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
                    <div key={i} className="p-4 border border-gray-200 rounded-lg">
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
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                          <span className="text-red-600 font-semibold text-lg">
                            {feedback.customerName?.charAt(0)?.toUpperCase() || (
                              <User className="w-5 h-5" />
                            )}
                          </span>
                        </div>
                        <div className="flex-1">
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
                          <div className="text-xs text-gray-500 mb-2">
                            {feedback.createdAt
                              ? new Date(feedback.createdAt).toLocaleDateString("vi-VN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : ""}
                          </div>
                          {feedback.comment && (
                            <p className="text-gray-700 mb-2 text-sm">{feedback.comment}</p>
                          )}
                          {feedback.imageUrls && feedback.imageUrls.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {feedback.imageUrls.map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Review image ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => window.open(url, "_blank")}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

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
              <p className="text-sm mt-1">
                Hãy mua sản phẩm và trở thành người đầu tiên đánh giá!
              </p>
            </div>
          )}
        </div>

        {/* Product Questions Section */}
        <div id="questions" className="bg-white rounded-xl p-6 border border-gray-200 scroll-mt-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Hỏi và đáp</h2>
              <p className="text-sm text-gray-500">Câu hỏi từ khách hàng</p>
            </div>
          </div>

          {/* Question Input Form */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex gap-3">
              <textarea
                value={questionContent}
                onChange={(e) => setQuestionContent(e.target.value)}
                placeholder="Viết câu hỏi của bạn tại đây..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                rows={3}
              />
              <Button
                onClick={handleSubmitQuestion}
                disabled={
                  createQuestionMutation.isLoading || !questionContent.trim()
                }
                className="bg-red-600 hover:bg-red-700 text-white px-6 h-auto self-end"
              >
                {createQuestionMutation.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : allQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có câu hỏi nào về sản phẩm này</p>
                <p className="text-sm mt-1">Hãy là người đầu tiên đặt câu hỏi!</p>
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

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}
