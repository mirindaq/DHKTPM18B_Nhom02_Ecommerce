// src/components/Header.tsx
import {
  Newspaper,
  Search,
  ShoppingCart,
  User,
  RefreshCcw,
  Store,
  PackageSearch,
  Phone,
  X,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { useNavigate, useLocation } from "react-router";
import { cartService } from "@/services/cart.service";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import type { Cart } from "@/types/cart.type";
import type { Product } from "@/types/product.type";
import type { CategoryListResponse } from "@/types/category.type";
import { PUBLIC_PATH } from "@/constants/path";
import { Button } from "@/components/ui/button";
import LoginModal from "../LoginModal";
import { useQuery } from "@/hooks/useQuery";

export default function Header() {
  const { isAuthenticated, user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const cartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Search states
  const [searchValue, setSearchValue] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        setSearchHistory([]);
      }
    }
  }, []);

  // Calculate header height for backdrop positioning
  useEffect(() => {
    if (headerRef.current) {
      const updateHeaderHeight = () => {
        setHeaderHeight(headerRef.current?.offsetHeight || 0);
      };
      updateHeaderHeight();
      window.addEventListener('resize', updateHeaderHeight);
      return () => window.removeEventListener('resize', updateHeaderHeight);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchValue]);

  // Show dropdown when search value changes or input is focused
  useEffect(() => {
    if (searchValue || searchInputRef.current === document.activeElement) {
      setShowSearchDropdown(true);
    }
  }, [searchValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setShowSearchDropdown(false);
    setSearchValue("");
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, user]);

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (cartTimeoutRef.current) {
        clearTimeout(cartTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const loadCart = async () => {
    try {
      const response = await cartService.getCart();
      if (response.status === 200) {
        setCart(response.data);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setCart(null);
    }
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      navigate(`${PUBLIC_PATH.HOME}cart`);
    }
  };

  const handleCartMouseEnter = () => {
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
      cartTimeoutRef.current = null;
    }
    setShowCartDropdown(true);
  };

  const handleCartMouseLeave = () => {
    cartTimeoutRef.current = setTimeout(() => {
      setShowCartDropdown(false);
    }, 150); // Delay 150ms để người dùng có thời gian di chuyển chuột
  };

  // Auto complete suggestions
  const { data: autoCompleteSuggestions, isLoading: isLoadingSuggestions } = useQuery<string[]>(
    () => productService.getAutoCompleteSuggestions(debouncedSearch, 5),
    {
      queryKey: ["header-autocomplete", debouncedSearch],
      enabled: debouncedSearch.trim().length >= 2, // Chỉ gọi khi có ít nhất 2 ký tự
      onError: (err) => {
        console.error("Error getting auto complete suggestions:", err);
      },
    }
  );

  // Search products with debounce
  const { data: searchResultsData, isLoading: isSearching } = useQuery<{
    data: { data: Product[]; totalItem: number };
  }>(
    () => productService.searchProductsWithElasticsearch(debouncedSearch, 1, 5, "popular"),
    {
      queryKey: ["header-search", debouncedSearch],
      enabled: debouncedSearch.trim().length > 0,
      onError: (err) => {
        console.error("Error searching products:", err);
      },
    }
  );

  const suggestedProducts = searchResultsData?.data?.data || [];
  const suggestions = autoCompleteSuggestions || [];

  // Load categories for dropdown
  const { data: categoriesData } = useQuery<CategoryListResponse>(
    () => categoryService.getAllCategoriesSimple(),
    {
      queryKey: ["categories", "header"],
    }
  );

  const categories = (categoriesData?.data?.data || []).filter((cat) => cat.status).slice(0, 8);

  const handleSearchSubmit = (query: string) => {
    if (query && query.trim()) {
      // Save to search history
      const trimmedQuery = query.trim();
      const newHistory = [
        trimmedQuery,
        ...searchHistory.filter((item) => item.toLowerCase() !== trimmedQuery.toLowerCase()),
      ].slice(0, 10); // Keep only last 10 searches
      setSearchHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));

      // Close dropdown immediately
      setShowSearchDropdown(false);
      setSearchValue("");

      // Navigate to search page
      navigate(`${PUBLIC_PATH.HOME}search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setShowSearchDropdown(false);
    searchInputRef.current?.focus();
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-[60] bg-gradient-to-b from-red-500 to-rose-600 text-white shadow-md py-2">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Banner */}
        <div className="text-white text-sm py-2">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left Side - Promotional Text */}
            <div className="flex items-center gap-3 flex-wrap">
              <span>Giao hàng nhanh - Miễn phí cho đơn 300k</span>
              <span className="w-1 h-1 bg-white rounded-full"></span>
              <div className="flex items-center gap-1.5">
                <RefreshCcw size={14} />
                <span>Thu cũ giá ngon - Lên đời tiết kiệm</span>
              </div>
            </div>

            {/* Right Side - Utility Links */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="h-4 w-px bg-white/50"></div>
              <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <Store size={14} />
                <span>Cửa hàng gần bạn</span>
              </button>
              <div className="h-4 w-px bg-white/50"></div>
              <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <PackageSearch size={14} />
                <span>Tra cứu đơn hàng</span>
              </button>
              <div className="h-4 w-px bg-white/50"></div>
              <a href="tel:18002097" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <Phone size={14} />
                <span>1800 2097</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-1 font-bold text-2xl tracking-tighter shrink-0">
            <a href={PUBLIC_PATH.HOME} className="hover:opacity-90 transition-opacity">
              <span className="text-white">EcomStore</span>
            </a>
          </div>

          {/* Thanh tìm kiếm - Center */}
          <div className="flex-1 max-w-2xl mx-4 relative">
            <form 
              className="group flex items-center bg-white rounded-lg px-4 py-2.5 text-gray-700 shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-offset-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit(searchValue);
              }}
            >
              <Search size={20} className="text-gray-400 shrink-0 group-hover:text-red-600 transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                name="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Bạn muốn mua gì hôm nay?"
                className="flex-1 bg-transparent outline-none ml-3 text-sm placeholder-gray-500 w-full focus:placeholder-gray-400 transition-colors"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit(searchValue);
                  }
                }}
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </form>

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <>
                {/* Backdrop - chỉ tối xung quanh, không tối header */}
                <div
                  className="fixed bg-black/30 z-[55] left-0 right-0 bottom-0"
                  style={{ top: `${headerHeight}px` }}
                  onClick={() => setShowSearchDropdown(false)}
                />
                <div
                  ref={searchDropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-[60] max-h-[600px] overflow-y-auto"
                >
                {/* Arrow pointing to search bar */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                </div>

                <div className="p-4">
                  {/* Auto Complete Suggestions */}
                  {searchValue && suggestions.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <PackageSearch size={16} className="text-gray-500" />
                        Gợi ý tìm kiếm
                      </h3>
                      <div className="space-y-1">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchValue(suggestion);
                              handleSearchSubmit(suggestion);
                            }}
                            className="w-full flex items-center gap-2 p-2.5 hover:bg-red-50 rounded-lg transition-all duration-200 text-left group border border-transparent hover:border-red-200 cursor-pointer"
                          >
                            <Search size={14} className="text-gray-400 group-hover:text-red-600 transition-colors shrink-0" />
                            <span className="text-sm text-gray-700 group-hover:text-red-600 transition-colors flex-1">
                              {suggestion}
                            </span>
                            <ChevronRight size={14} className="text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Results / Suggested Products */}
                  {searchValue && (
                    <>
                      {isSearching || isLoadingSuggestions ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                        </div>
                      ) : suggestedProducts.length > 0 ? (
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Sản phẩm gợi ý</h3>
                          <div className="space-y-2">
                            {suggestedProducts.map((product) => (
                              <button
                                key={product.id}
                                onClick={() => {
                                  setShowSearchDropdown(false);
                                  setSearchValue("");
                                  navigate(`${PUBLIC_PATH.HOME}product/${product.slug}`);
                                }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-all duration-200 text-left group border border-transparent hover:border-red-200 cursor-pointer"
                              >
                                <img
                                  src={product.thumbnail}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/assets/avatar.jpg";
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                                    {product.name}
                                  </p>
                                  {product.variants && product.variants.length > 0 && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-sm font-semibold text-red-600">
                                        {formatPrice(product.variants[0].price)}đ
                                      </span>
                                      {product.variants[0].oldPrice && product.variants[0].oldPrice > product.variants[0].price && (
                                        <span className="text-xs text-gray-400 line-through">
                                          {formatPrice(product.variants[0].oldPrice)}đ
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : debouncedSearch.trim().length > 0 && suggestions.length === 0 ? (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 py-4 text-center">
                            Không tìm thấy sản phẩm nào
                          </p>
                        </div>
                      ) : null}
                    </>
                  )}

                  {/* Search History */}
                  {!searchValue && searchHistory.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-500" />
                          <h3 className="text-sm font-semibold text-gray-900">Lịch sử tìm kiếm</h3>
                        </div>
                        <button
                          onClick={handleClearHistory}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <X size={14} />
                          Xóa tất cả
                        </button>
                      </div>
                      <div className="space-y-1">
                        {searchHistory.slice(0, 5).map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearchSubmit(item)}
                            className="w-full flex items-center gap-2 p-3 hover:bg-red-50 rounded-lg transition-all duration-200 text-left group border border-transparent hover:border-red-200 cursor-pointer"
                          >
                            <Clock size={14} className="text-gray-400 shrink-0 group-hover:text-red-600 transition-colors" />
                            <span className="text-sm text-gray-700 flex-1 group-hover:text-red-600 transition-colors">{item}</span>
                            <ChevronRight size={14} className="text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  {!searchValue && categories.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Store size={16} className="text-gray-500" />
                        <h3 className="text-sm font-semibold text-gray-900">Danh mục sản phẩm</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              setSearchValue("");
                              navigate(`${PUBLIC_PATH.HOME}search/${category.slug}`);
                            }}
                            className="flex items-center gap-2 p-3 hover:bg-red-50 rounded-lg transition-all duration-200 text-left border border-gray-100 hover:border-red-200 group cursor-pointer"
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-200">
                              <img
                                src={category.image || "/assets/avatar.jpg"}
                                alt={category.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/assets/avatar.jpg";
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-700 line-clamp-2 flex-1 group-hover:text-red-600 transition-colors">{category.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Tin tức */}
            <Button 
              variant="ghost"
              className="hidden md:flex items-center gap-2 text-white hover:bg-white/20 px-3 py-2 rounded-lg"
              onClick={() => navigate(`${PUBLIC_PATH.HOME}news`)}
            >
              <Newspaper size={20} />
              <span className="text-sm font-medium">Tin tức</span>
            </Button>

            {/* Giỏ hàng */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-white/20 rounded-lg transition-colors"
                onClick={handleCartClick}
                onMouseEnter={handleCartMouseEnter}
                onMouseLeave={handleCartMouseLeave}
              >
                <div className="relative">
                  <ShoppingCart size={22} />
                  {cart && cart.items && cart.items?.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-red-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {cart.items?.length}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:inline">Giỏ hàng</span>
              </button>

              {/* Cart Dropdown với bridge để tránh mất hover */}
              {showCartDropdown && isAuthenticated && cart && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                  onMouseEnter={handleCartMouseEnter}
                  onMouseLeave={handleCartMouseLeave}
                >
                  <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent"></div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 text-base">
                      Giỏ hàng của bạn
                    </h3>
                    {cart.items.length === 0 ? (
                      <p className="text-gray-500 text-center py-6">
                        Giỏ hàng trống
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {cart.items.slice(0, 3).map((item) => (
                          <div
                            key={item.productVariantId}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-14 h-14 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.productName}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Số lượng: {item.quantity}
                              </p>
                              <p className="text-sm font-semibold text-red-600 mt-1">
                                {item.price.toLocaleString()}đ
                              </p>
                            </div>
                          </div>
                        ))}
                        {cart.items.length > 3 && (
                          <p className="text-xs text-gray-500 text-center py-2">
                            +{cart.items.length - 3} sản phẩm khác
                          </p>
                        )}
                      </div>
                    )}
                    {cart.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-gray-900">
                            Tổng cộng:
                          </span>
                          <span className="font-bold text-red-600 text-lg">
                            {cart.totalPrice.toLocaleString()}đ
                          </span>
                        </div>
                        <button
                          className="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                          onClick={() => {
                            setShowCartDropdown(false);
                            navigate(`${PUBLIC_PATH.HOME}cart`);
                          }}
                        >
                          Xem giỏ hàng
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Account */}
            {isAuthenticated && user ? (
              <Button
                variant="ghost"
                className="hidden sm:flex items-center gap-2 text-white hover:bg-white/20 px-3 py-2 rounded-lg"
                onClick={() => navigate(`${PUBLIC_PATH.HOME}profile`)}
              >
                <User size={20} />
                <div className="text-left">
                  <span className="block text-sm font-semibold leading-tight">
                    {user.fullName}
                  </span>
                  <span className="block text-xs opacity-90">Tài khoản</span>
                </div>
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="hidden sm:flex items-center gap-2 text-white hover:bg-white/20 px-3 py-2 rounded-lg"
                onClick={() => setShowLoginModal(true)}
              >
                <User size={20} />
                <div className="text-left">
                  <span className="block text-sm font-semibold leading-tight">Đăng nhập</span>
                  <span className="block text-xs opacity-90">Đăng ký</span>
                </div>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="sm:hidden text-white hover:bg-white/20 p-2"
              onClick={() => setShowLoginModal(true)}
            >
              <User size={20} />
            </Button>
          </div>
        </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </header>
  );
}
