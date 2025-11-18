import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Filter,
  Truck,
  DollarSign,
  ChevronDown,
  Package,
  Cpu,
  Monitor,
  Camera,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type { Variant } from '@/types/variant.type';
import { useState, useEffect, useRef } from 'react';

interface FilterSectionProps {
  variants: Variant[];
  loading?: boolean;
}

export default function FilterSection({ variants, loading }: FilterSectionProps) {
  const [selectedFilters, setSelectedFilters] = useState<{
    inStock?: boolean;
    priceView?: boolean;
    [key: string]: any;
  }>({});
  
  const [priceRange, setPriceRange] = useState<[number, number]>([50000, 10000000]);

  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});
  const [selectedVariantValues, setSelectedVariantValues] = useState<{ [variantId: number]: number[] }>({});
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const toggleDropdown = (key: string) => {
    setOpenDropdowns((prev) => {
      const newState = { ...prev };
      // Close all other dropdowns
      Object.keys(newState).forEach((k) => {
        if (k !== key) {
          newState[k] = false;
        }
      });
      newState[key] = !prev[key];
      return newState;
    });
  };

  const priceDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(openDropdowns).forEach((key) => {
        const ref = dropdownRefs.current[key];
        if (ref && !ref.contains(event.target as Node) && openDropdowns[key]) {
          setOpenDropdowns((prev) => ({ ...prev, [key]: false }));
        }
      });
      
      // Close price dropdown
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target as Node) && selectedFilters.priceView) {
        setSelectedFilters((prev) => ({ ...prev, priceView: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdowns, selectedFilters.priceView]);

  const filterButtons = [
    { key: 'filter', label: 'Bộ lọc', icon: Filter, isActive: true },
    { key: 'inStock', label: 'Sẵn hàng', icon: Truck },
    { key: 'priceView', label: 'Xem theo giá', icon: DollarSign },
  ];

  // Map variant names to icons (fallback icons)
  const getIconForVariant = (variantName: string) => {
    const name = variantName.toLowerCase();
    if (name.includes('bộ nhớ') || name.includes('dung lượng') || name.includes('storage') || name.includes('memory')) {
      return Package;
    }
    if (name.includes('ram')) {
      return Cpu;
    }
    if (name.includes('màn hình') || name.includes('screen') || name.includes('display') || name.includes('kích thước')) {
      return Monitor;
    }
    if (name.includes('camera')) {
      return Camera;
    }
    if (name.includes('tần số') || name.includes('refresh') || name.includes('hz')) {
      return RefreshCw;
    }
    if (name.includes('tính năng') || name.includes('special') || name.includes('đặc biệt')) {
      return Sparkles;
    }
    return Monitor; // Default icon
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Chọn theo tiêu chí</h3>
        <div className="flex flex-wrap gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Chọn theo tiêu chí</h3>
      
      {/* First Row - Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-3">
        {filterButtons.map((filter) => {
          const Icon = filter.icon;
          const isActive = filter.isActive || selectedFilters[filter.key];
          const isPriceView = filter.key === 'priceView';
          
          return (
            <div key={filter.key} className="relative">
              <Button
                variant={isActive ? 'default' : 'outline'}
                onClick={() => {
                  if (filter.key !== 'filter') {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      [filter.key]: !prev[filter.key],
                    }));
                  }
                }}
                className={
                  isActive
                    ? 'bg-red-600 text-white hover:bg-red-700 border-red-600'
                    : 'border-gray-300 hover:border-red-600 hover:text-red-600'
                }
              >
                <Icon size={16} className="mr-2" />
                {filter.label}
              </Button>
              
              {/* Price Range Slider Dropdown */}
              {isPriceView && selectedFilters.priceView && (
                <div 
                  ref={priceDropdownRef}
                  className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[400px] p-4"
                >
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Chọn khoảng giá</h4>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      min={50000}
                      max={10000000}
                      step={100000}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>{priceRange[0].toLocaleString('vi-VN')} đ</span>
                      <span>{priceRange[1].toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFilters((prev) => ({ ...prev, priceView: false }));
                      }}
                      className="bg-white hover:bg-gray-50"
                    >
                      Đóng
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedFilters((prev) => ({ ...prev, priceView: false }));
                        // Handle view results with price range
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Xem kết quả
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Dropdown Filters - First Row - Show variants from API */}
        {variants.slice(0, 3).map((variant) => {
          const Icon = getIconForVariant(variant.name);
          const isOpen = openDropdowns[`variant-${variant.id}`];
          const values = variant.variantValues || [];

          return (
            <div
              key={variant.id}
              className="relative"
              ref={(el) => {
                dropdownRefs.current[`variant-${variant.id}`] = el;
              }}
            >
              <Button
                variant="outline"
                onClick={() => toggleDropdown(`variant-${variant.id}`)}
                className={
                  openDropdowns[`variant-${variant.id}`] || (selectedVariantValues[variant.id] && selectedVariantValues[variant.id].length > 0)
                    ? 'border-red-600 text-red-600 hover:border-red-700'
                    : 'border-gray-300 hover:border-red-600 hover:text-red-600'
                }
              >
                <Icon size={16} className="mr-2" />
                {variant.name}
                <ChevronDown size={16} className="ml-2" />
              </Button>
              {isOpen && values.length > 0 && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[500px] max-w-[600px]">
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-2 mb-4 max-h-[300px] overflow-y-auto">
                      {values.map((value) => {
                        const isSelected = selectedVariantValues[variant.id]?.includes(value.id);
                        return (
                          <button
                            key={value.id}
                            className={`px-3 py-2 text-sm rounded-lg border transition-colors text-center whitespace-nowrap ${
                              isSelected
                                ? 'border-red-600 bg-red-50 text-red-600'
                                : 'border-gray-200 hover:border-red-600 hover:bg-red-50 hover:text-red-600'
                            }`}
                            onClick={() => {
                              setSelectedVariantValues((prev) => {
                                const current = prev[variant.id] || [];
                                const newValues = isSelected
                                  ? current.filter((id) => id !== value.id)
                                  : [...current, value.id];
                                return { ...prev, [variant.id]: newValues };
                              });
                            }}
                          >
                            {value.value}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDropdown(`variant-${variant.id}`)}
                        className="bg-white hover:bg-gray-50"
                      >
                        Đóng
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          toggleDropdown(`variant-${variant.id}`);
                          // Handle view results
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Xem kết quả
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Second Row - More Dropdown Filters - Show remaining variants from API */}
      <div className="flex flex-wrap gap-3">
        {variants.slice(3).map((variant) => {
          const Icon = getIconForVariant(variant.name);
          const isOpen = openDropdowns[`variant-${variant.id}`];
          const values = variant.variantValues || [];

          return (
            <div
              key={variant.id}
              className="relative"
              ref={(el) => {
                dropdownRefs.current[`variant-${variant.id}`] = el;
              }}
            >
              <Button
                variant="outline"
                onClick={() => toggleDropdown(`variant-${variant.id}`)}
                className={
                  openDropdowns[`variant-${variant.id}`] || (selectedVariantValues[variant.id] && selectedVariantValues[variant.id].length > 0)
                    ? 'border-red-600 text-red-600 hover:border-red-700'
                    : 'border-gray-300 hover:border-red-600 hover:text-red-600'
                }
              >
                <Icon size={16} className="mr-2" />
                {variant.name}
                <ChevronDown size={16} className="ml-2" />
              </Button>
              {isOpen && values.length > 0 && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[500px] max-w-[600px]">
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-2 mb-4 max-h-[300px] overflow-y-auto">
                      {values.map((value) => {
                        const isSelected = selectedVariantValues[variant.id]?.includes(value.id);
                        return (
                          <button
                            key={value.id}
                            className={`px-3 py-2 text-sm rounded-lg border transition-colors text-center whitespace-nowrap ${
                              isSelected
                                ? 'border-red-600 bg-red-50 text-red-600'
                                : 'border-gray-200 hover:border-red-600 hover:bg-red-50 hover:text-red-600'
                            }`}
                            onClick={() => {
                              setSelectedVariantValues((prev) => {
                                const current = prev[variant.id] || [];
                                const newValues = isSelected
                                  ? current.filter((id) => id !== value.id)
                                  : [...current, value.id];
                                return { ...prev, [variant.id]: newValues };
                              });
                            }}
                          >
                            {value.value}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDropdown(`variant-${variant.id}`)}
                        className="bg-white hover:bg-gray-50"
                      >
                        Đóng
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          toggleDropdown(`variant-${variant.id}`);
                          // Handle view results
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Xem kết quả
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

