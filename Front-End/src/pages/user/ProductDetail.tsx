import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Star, 
  ShoppingCart, 
  MessageCircle, 
  Settings, 
  Plus,
  ChevronRight,
  Check,
  Shield,
  Headphones,
  ArrowUp
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { cartService } from "@/services/cart.service";
import { productService } from "@/services/product.service";
import { AUTH_PATH, PUBLIC_PATH } from "@/constants/path";
import type { Product } from "@/types/product.type";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  // Dynamic state for attributes and variants
  const [attributes, setAttributes] = useState<any[]>([]);
  const [availableVariants, setAvailableVariants] = useState<{[key: string]: string[]}>({});
  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: string}>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    const variantGroups: {[key: string]: Set<string>} = {};
    const defaultSelections: {[key: string]: string} = {};

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
    const availableVariants: {[key: string]: string[]} = {};
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
      navigate(AUTH_PATH.LOGIN_USER);
      return;
    }

    // Find the matching variant based on current selections
    const matchingVariant = findMatchingVariant();
    
    if (!matchingVariant) {
      console.error('Không tìm thấy variant phù hợp với lựa chọn hiện tại');
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
      
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate(AUTH_PATH.LOGIN_USER);
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error || 'Không tìm thấy sản phẩm'}
          </h2>
          <p className="text-gray-600 mb-4">Sản phẩm có thể đã bị xóa hoặc không tồn tại</p>
          <button
            onClick={() => navigate(PUBLIC_PATH.HOME)}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <span className="hover:text-red-600 cursor-pointer">Trang chủ</span>
            <span className="mx-2">/</span>
            <span className="hover:text-red-600 cursor-pointer">Laptop</span>
            <span className="mx-2">/</span>
            <span className="hover:text-red-600 cursor-pointer">ASUS</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Images & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600">CORE 5-210H/16GB/512GB PCIE/VGA 6GB RTX3050/16.0 WUXGA...</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Yêu thích
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Hỏi đáp
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Thông số
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                So sánh
              </Button>
            </div>

            {/* Featured Section */}
            <div className="bg-gradient-to-r from-pink-500 to-red-600 rounded-lg p-6 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={product.thumbnail} 
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="mt-2 text-sm">
                    <p className="font-semibold">CORE 5-210H | RTX 3050</p>
                    <p>16GB 512GB 16" WUXGA</p>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-4">TÍNH NĂNG NỔI BẬT</h2>
                  <ul className="space-y-2 text-sm">
                    <li>• Trang bị vi xử lý Intel Core 5-210H, máy mang lại khả năng xử lý mượt mà cho mọi trò chơi và ứng dụng nặng.</li>
                    <li>• Với 16GB RAM và ổ cứng 512GB PCIe, bạn có không gian lưu trữ rộng rãi và khả năng đa nhiệm ấn tượng.</li>
                    <li>• Màn hình 16.0 inch WUXGA 144Hz cung cấp hình ảnh sắc nét và mượt mà.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Product Image Gallery */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Hình ảnh sản phẩm</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.productImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`relative flex-shrink-0 cursor-pointer ${
                      index === currentImageIndex ? 'ring-2 ring-red-500' : ''
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    {index === 0 && (
                      <div className="absolute top-1 left-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg">
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Product Commitments */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Cam kết sản phẩm</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Nguyên hộp, đầy đủ phụ kiện từ nhà sản xuất</p>
                    <p className="text-sm text-gray-600">Bảo hành pin và bộ sạc 12 tháng</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Bảo hành 24 tháng tại trung tâm bảo hành Chính hãng</p>
                    <p className="text-sm text-gray-600">1 đổi 1 trong 30 ngày nếu có lỗi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Options */}
          <div className="space-y-6">
            {/* Price */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Giá sản phẩm</h3>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(selectedVariant?.price || 0)}
                </span>
                {selectedVariant?.oldPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(selectedVariant.oldPrice)}
                  </span>
                )}
              </div>
            </div>


            {/* Dynamic Custom Configuration */}
            {Object.keys(availableVariants).length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Lựa chọn cấu hình tùy chỉnh</h3>
                  <button 
                    className="text-red-600 text-sm font-medium hover:text-red-700 transition-colors duration-200"
                    onClick={() => {
                      const defaultSelections: {[key: string]: string} = {};
                      Object.keys(availableVariants).forEach(variantName => {
                        defaultSelections[variantName] = availableVariants[variantName][0];
                      });
                      setSelectedVariants(defaultSelections);
                    }}
                  >
                    Thiết lập lại
                  </button>
                </div>

                <div className="space-y-6">
                  {Object.keys(availableVariants).map((variantName, _index) => (
                    <div key={variantName} className="mb-6">
                      <h4 className="font-semibold text-gray-900 text-base mb-4">{variantName.toUpperCase()}</h4>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
                        {availableVariants[variantName].map((value) => (
                          <button
                            key={value}
                            className={`p-3 text-sm border rounded-lg transition-all duration-200 ${
                              selectedVariants[variantName] === value 
                                ? 'border-red-500 bg-red-50 text-red-700 font-semibold' 
                                : 'border-gray-200 hover:border-red-300 hover:bg-gray-50 text-gray-700'
                            }`}
                            onClick={() => handleVariantSelection(variantName, value)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-left">{value}</span>
                              {selectedVariants[variantName] === value && (
                                <Check className="w-4 h-4 text-red-600 ml-2 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-lg p-6 space-y-4">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleBuyNow}
              >
                Trả góp 0%
              </Button>
              
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-lg py-3"
                onClick={handleBuyNow}
              >
                MUA NGAY
              </Button>
              
              <Button 
                variant="outline"
                className="w-full border-red-600 text-red-600 hover:bg-red-50"
                onClick={handleAddToCart}
                disabled={isAddingToCart || isAddedToCart}
              >
                {isAddingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    Đang thêm...
                  </>
                ) : isAddedToCart ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Đã thêm vào giỏ
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Thêm vào giỏ hàng
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full border-red-600 text-red-600 hover:bg-red-50"
              >
                <Headphones className="w-4 h-4 mr-2" />
                Liên hệ
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Technical Specifications */}
        <div className="mt-8 bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Thông số kỹ thuật</h2>
            <button className="text-red-600 font-medium">Xem tất cả &gt;</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {attributes.slice(0, Math.ceil(attributes.length / 2)).map((attr, index) => (
                <div key={index} className="flex">
                  <div className="w-1/3 bg-gray-100 p-3 font-medium">{attr.attribute.name}</div>
                  <div className="w-2/3 bg-white p-3 border-l">{attr.value}</div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              {attributes.slice(Math.ceil(attributes.length / 2)).map((attr, index) => (
                <div key={index} className="flex">
                  <div className="w-1/3 bg-gray-100 p-3 font-medium">{attr.attribute.name}</div>
                  <div className="w-2/3 bg-white p-3 border-l">{attr.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Buttons */}
      {showScrollTop && (
        <div className="fixed bottom-6 right-6 space-y-3 z-50">
          <Button
            onClick={scrollToTop}
            className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-700"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
          <Button
            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700"
          >
            <Headphones className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
