import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Headphones,
  ArrowUp,
  Zap,
  Truck,
  RotateCcw,
  Check,
  GitCompareArrows
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { cartService } from "@/services/cart.service";
import { productService } from "@/services/product.service";
import { PUBLIC_PATH } from "@/constants/path";
import type { Product } from "@/types/product.type";
import { toast } from "sonner";
import LoginModal from "@/components/user/LoginModal";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  // Dynamic state for attributes and variants
  const [attributes, setAttributes] = useState<any[]>([]);
  const [availableVariants, setAvailableVariants] = useState<{ [key: string]: string[] }>({});
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Load product data from API
  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
        const response = await productService.getProductBySlug(slug);

        if (response.status === 200 && response.data) {
          setProduct(response.data);
          setAttributes(response.data.attributes || []);

          if (response.data.variants && response.data.variants.length > 0) {
            setSelectedVariant(response.data.variants[0]);
            extractVariantsFromProduct(response.data);
          }
        } else {
          setError('Không tìm thấy sản phẩm');
        }
      } catch (error) {
        console.error('Error loading product:', error);
        setError('Có lỗi xảy ra khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Extract variants from API data dynamically
  const extractVariantsFromProduct = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return;

    const variantGroups: { [key: string]: Set<string> } = {};
    const defaultSelections: { [key: string]: string } = {};

    product.variants.forEach(variant => {
      if (variant.productVariantValues) {
        variant.productVariantValues.forEach(variantValue => {
          const { value } = variantValue.variantValue;
          const variantName = variantValue.variantValue.variantName || 'Mặc định';

          if (!variantGroups[variantName]) {
            variantGroups[variantName] = new Set();
          }
          variantGroups[variantName].add(value);
        });
      }
    });

    // Convert Sets to Arrays and set defaults
    const availableVariants: { [key: string]: string[] } = {};
    Object.keys(variantGroups).forEach(variantName => {
      availableVariants[variantName] = Array.from(variantGroups[variantName]);
      defaultSelections[variantName] = availableVariants[variantName][0];
    });

    setAvailableVariants(availableVariants);
    setSelectedVariants(defaultSelections);
  };

  // Find matching variant based on selections
  const findMatchingVariant = () => {
    if (!product?.variants) return null;

    return product.variants.find(variant => {
      if (!variant.productVariantValues) return false;

      // Get all variant values for this variant
      const variantValues = variant.productVariantValues.map(vv => ({
        name: vv.variantValue.variantName,
        value: vv.variantValue.value
      }));

      // Check if all selected variants match this variant
      return Object.keys(selectedVariants).every(variantName => {
        const selectedValue = selectedVariants[variantName];
        if (!selectedValue) return true;

        return variantValues.some(vv =>
          vv.name === variantName && vv.value === selectedValue
        );
      });
    });
  };

  // Update selected variant when selections change
  useEffect(() => {
    const matchingVariant = findMatchingVariant();
    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  }, [selectedVariants, product]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Find the matching variant based on current selections
    const matchingVariant = findMatchingVariant();

    if (!matchingVariant) {
      console.error('Không tìm thấy variant phù hợp với lựa chọn hiện tại');
      toast.error('Không tìm thấy sản phẩm phù hợp');
      return;
    }

    console.log('Selected variants:', selectedVariants);
    console.log('Matching variant ID:', matchingVariant.id);

    try {
      setIsAddingToCart(true);
      await cartService.addProductToCart({
        productVariantId: matchingVariant.id,
        quantity: 1
      });

      toast.success('Đã thêm vào giỏ hàng thành công!');
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      toast.error('Không thể thêm vào giỏ hàng');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Find the matching variant based on current selections
    const matchingVariant = findMatchingVariant();

    if (!matchingVariant) {
      console.error('Không tìm thấy variant phù hợp với lựa chọn hiện tại');
      return;
    }

    console.log('Buy now - Selected variants:', selectedVariants);
    console.log('Buy now - Matching variant ID:', matchingVariant.id);

    // Logic mua ngay - có thể lưu variant ID vào state hoặc localStorage
    navigate(`${PUBLIC_PATH.HOME}checkout`);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle variant selection
  const handleVariantSelection = (variantName: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {error || 'Không tìm thấy sản phẩm'}
            </h2>
            <p className="text-gray-600 mb-6">Sản phẩm có thể đã bị xóa hoặc không tồn tại</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500 hover:text-red-600 cursor-pointer transition-colors">Trang chủ</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 hover:text-red-600 cursor-pointer transition-colors">Laptop</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 hover:text-red-600 cursor-pointer transition-colors">ASUS</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Product Images & Info */}
          <div className="lg:col-span-7 space-y-8">
            {/* Product Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-gray-400" />
                <span>Yêu thích</span>
              </div>
              <div className="flex items-center space-x-1">
                 <GitCompareArrows className="w-4 h-4 text-gray-400" />
                <span>So sánh</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <span>Hỏi đáp</span>
              </div>
              <div className="flex items-center space-x-1">
                <Settings className="w-4 h-4 text-gray-400" />
                <span>Thông số</span>
              </div>
            </div>

            {/* Featured Section */}
            <Card className="overflow-hidden">
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-90 object-cover rounded-xl transition-transform group-hover:scale-105"
              />  
            </Card>

            {/* Product Image Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Hình ảnh sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.productImages.map((image, index) => (
                    <div
                      key={index}
                      className={`relative flex-shrink-0 cursor-pointer group transition-all duration-200 ${index === currentImageIndex
                        ? 'ring-2 ring-red-500 ring-offset-2 scale-105'
                        : 'hover:scale-105'
                        }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-24 h-24 object-cover transition-transform group-hover:scale-110"
                        />
                        {index === currentImageIndex && (
                          <div className="absolute inset-0 bg-red-500/20 rounded-lg"></div>
                        )}
                        {index === 0 && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-yellow-500 text-white text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Chính
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-center w-24 h-24 border-1 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Commitments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Cam kết sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">Nguyên hộp, đầy đủ phụ kiện từ nhà sản xuất</p>
                      <p className="text-sm text-gray-600">Bảo hành pin và bộ sạc 12 tháng</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">Bảo hành 24 tháng tại trung tâm bảo hành Chính hãng</p>
                      <p className="text-sm text-gray-600">1 đổi 1 trong 30 ngày nếu có lỗi</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">Giao hàng miễn phí toàn quốc</p>
                      <p className="text-sm text-gray-600">Nhận hàng trong 24h tại TP.HCM, 2-3 ngày các tỉnh khác</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Purchase Options */}
          <div className="space-y-6 lg:col-span-5">
            {/* Price */}
            <Card className="border-1 border-red-100">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-600" />
                  Giá sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-red-600">
                      {formatPrice(selectedVariant?.price || 0)}
                    </span>
                    {(selectedVariant?.oldPrice > 0) && (
                      <div className="space-y-1">
                        <span className="text-lg text-gray-400 line-through block">
                          {formatPrice(selectedVariant.oldPrice)}
                        </span>
                        <Badge className="bg-green-100 text-green-800">
                          Tiết kiệm {formatPrice(selectedVariant.oldPrice - (selectedVariant?.price || 0))}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {(selectedVariant?.oldPrice > 0) && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <span className="font-semibold">
                        Giảm {Math.round(((selectedVariant.oldPrice - (selectedVariant?.price || 0)) / selectedVariant.oldPrice) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>


            {/* Dynamic Custom Configuration */}
            {Object.keys(availableVariants).length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      Lựa chọn cấu hình tùy chỉnh
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        const defaultSelections: { [key: string]: string } = {};
                        Object.keys(availableVariants).forEach(variantName => {
                          defaultSelections[variantName] = availableVariants[variantName][0];
                        });
                        setSelectedVariants(defaultSelections);
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Thiết lập lại
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {Object.keys(availableVariants).map((variantName, _index) => (
                      <div key={variantName} className="space-y-4">
                        <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          {variantName.toUpperCase()}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {availableVariants[variantName].map((value) => (
                            <button
                              key={value}
                              className={`p-4 text-sm border-1 rounded-xl transition-all duration-300 group ${selectedVariants[variantName] === value
                                ? 'border-red-500 text-red-700 font-semibold shadow-md scale-105'
                                : 'border-gray-200 hover:border-red-300 hover:bg-gray-50 text-gray-700 hover:shadow-sm hover:scale-102'
                                }`}
                              onClick={() => handleVariantSelection(variantName, value)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-left font-medium">{value}</span>
                                {selectedVariants[variantName] === value && (
                                  <div className="flex items-center gap-1">
                                    <Check className="w-4 h-4 text-red-600" />
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card>
              <CardContent >
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="h-16 border-blue-400 text-blue-600 hover:bg-blue-50 hover:border-blue-500 hover:ring-2 hover:ring-blue-200 font-semibold py-3 rounded-xl transition-all duration-300"
                    onClick={handleBuyNow}
                  >
                    <Zap className="w-5 h-5 mr-1" />
                    Trả góp 0%
                  </Button>

                  <Button
                    className="col-span-1 h-16 bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    onClick={handleBuyNow}
                  >
                    <div className="text-center">
                      <div className="text-xl font-extrabold mb-1">MUA NGAY</div>
                    </div>
                  </Button>

                  {/* Nút Thêm vào giỏ */}
                  <Button
                    variant="outline"
                    className="h-16 border-red-400 text-red-600 hover:bg-red-50 hover:border-red-500 hover:ring-2 hover:ring-red-200 font-semibold py-3 rounded-xl transition-all duration-300"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-1"></div>
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-1" />
                        Thêm vào giỏ
                      </>
                    )}
                  </Button>
                </div>


              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dynamic Technical Specifications */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Settings className="w-6 h-6 text-blue-600" />
                Thông số kỹ thuật
              </CardTitle>
              <Button variant="ghost" size="lg" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {attributes.slice(0, Math.ceil(attributes.length / 2)).map((attr, index) => (
                  <div key={index} className="flex group hover:bg-gray-50 transition-colors rounded-lg">
                    <div className="w-1/3 bg-gradient-to-r from-gray-100 to-gray-50 p-4 font-semibold text-gray-700 border-r border-gray-200 rounded-l-lg">
                      {attr.attribute.name}
                    </div>
                    <div className="w-2/3 bg-white p-4 text-gray-900 font-medium rounded-r-lg">
                      {attr.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {attributes.slice(Math.ceil(attributes.length / 2)).map((attr, index) => (
                  <div key={index} className="flex group hover:bg-gray-50 transition-colors rounded-lg">
                    <div className="w-1/3 bg-gradient-to-r from-gray-100 to-gray-50 p-4 font-semibold text-gray-700 border-r border-gray-200 rounded-l-lg">
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
      </div>

      {/* Floating Buttons */}
      {showScrollTop && (
        <div className="fixed bottom-6 right-6 space-y-3 space-x-3 z-50">
          <Button
            onClick={scrollToTop}
            size="lg"
            className="w-14 h-14 rounded-full bg-gray-600 hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          >
            <ArrowUp className="w-6 h-6" />
          </Button>
          <Button
            size="lg"
            className="w-14 h-14 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          >
            <Headphones className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}
