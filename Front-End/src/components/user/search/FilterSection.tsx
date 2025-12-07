import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Filter,
  Truck,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import type { FilterCriteria } from '@/types/filterCriteria.type';
import { useState, useEffect, useRef } from 'react';

interface SearchFilters {
  brands?: number[];
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  filterValues?: number[];
}

interface FilterSectionProps {
  filterCriterias: FilterCriteria[];
  loading?: boolean;
  filters?: SearchFilters;
  onFilterChange?: (filters: SearchFilters) => void;
}

export default function FilterSection({ 
  filterCriterias, 
  loading,
  filters: externalFilters,
  onFilterChange 
}: FilterSectionProps) {
  const [selectedFilters, setSelectedFilters] = useState<{
    inStock?: boolean;
    priceView?: boolean;
    [key: string]: any;
  }>({});
  
  const [priceRange, setPriceRange] = useState<[number, number]>([50000, 10000000]);

  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});
  const [selectedFilterValues, setSelectedFilterValues] = useState<number[]>([]);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (externalFilters) {
      if (externalFilters.inStock) {
        setSelectedFilters(prev => ({ ...prev, inStock: true }));
      }
      if (externalFilters.priceMin !== undefined || externalFilters.priceMax !== undefined) {
        setPriceRange([
          externalFilters.priceMin || 50000, 
          externalFilters.priceMax || 10000000
        ]);
      }
      if (externalFilters.filterValues) {
        setSelectedFilterValues(externalFilters.filterValues);
      }
    }
  }, [externalFilters]);

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

  const handleFilterValueToggle = (filterValueId: number) => {
    setSelectedFilterValues(prev => {
      if (prev.includes(filterValueId)) {
        return prev.filter(id => id !== filterValueId);
      } else {
        return [...prev, filterValueId];
      }
    });
  };

  const handleApplyFilterCriteria = (criteriaId: number) => {
    if (onFilterChange) {
      onFilterChange({
        ...externalFilters,
        filterValues: selectedFilterValues,
      });
    }
    toggleDropdown(`criteria-${criteriaId}`);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Chọn theo tiêu chí</h3>
      
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
                    const newValue = !selectedFilters[filter.key];
                    setSelectedFilters((prev) => ({
                      ...prev,
                      [filter.key]: newValue,
                    }));
                    
                    if (filter.key === 'inStock' && onFilterChange) {
                      onFilterChange({
                        ...externalFilters,
                        inStock: newValue,
                      });
                    }
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
                        if (onFilterChange) {
                          onFilterChange({
                            ...externalFilters,
                            priceMin: priceRange[0],
                            priceMax: priceRange[1],
                          });
                        }
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

        {filterCriterias.slice(0, 3).map((criteria) => {
          const isOpen = openDropdowns[`criteria-${criteria.id}`];
          const values = criteria.filterValues || [];

          return (
            <div
              key={criteria.id}
              className="relative"
              ref={(el) => {
                dropdownRefs.current[`criteria-${criteria.id}`] = el;
              }}
            >
              <Button
                variant="outline"
                onClick={() => toggleDropdown(`criteria-${criteria.id}`)}
                className={
                  openDropdowns[`criteria-${criteria.id}`] || 
                  (values.some(v => selectedFilterValues.includes(v.id)))
                    ? 'border-red-600 text-red-600 hover:border-red-700'
                    : 'border-gray-300 hover:border-red-600 hover:text-red-600'
                }
              >
                {criteria.name}
                <ChevronDown size={16} className="ml-2" />
              </Button>
              {isOpen && values.length > 0 && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[500px] max-w-[600px]">
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2 mb-4 max-h-[300px] overflow-y-auto">
                      {values.map((value) => {
                        const isSelected = selectedFilterValues.includes(value.id);
                        return (
                          <button
                            key={value.id}
                            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                              isSelected
                                ? 'border-red-600 bg-red-50 text-red-600'
                                : 'border-gray-200 hover:border-red-600 hover:bg-red-50 hover:text-red-600'
                            }`}
                            onClick={() => handleFilterValueToggle(value.id)}
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
                        onClick={() => toggleDropdown(`criteria-${criteria.id}`)}
                        className="bg-white hover:bg-gray-50"
                      >
                        Đóng
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApplyFilterCriteria(criteria.id)}
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

      <div className="flex flex-wrap gap-3">
        {filterCriterias.slice(3).map((criteria) => {
          const isOpen = openDropdowns[`criteria-${criteria.id}`];
          const values = criteria.filterValues || [];

          return (
            <div
              key={criteria.id}
              className="relative"
              ref={(el) => {
                dropdownRefs.current[`criteria-${criteria.id}`] = el;
              }}
            >
              <Button
                variant="outline"
                onClick={() => toggleDropdown(`criteria-${criteria.id}`)}
                className={
                  openDropdowns[`criteria-${criteria.id}`] || 
                  (values.some(v => selectedFilterValues.includes(v.id)))
                    ? 'border-red-600 text-red-600 hover:border-red-700'
                    : 'border-gray-300 hover:border-red-600 hover:text-red-600'
                }
              >
                {criteria.name}
                <ChevronDown size={16} className="ml-2" />
              </Button>
              {isOpen && values.length > 0 && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[500px] max-w-[600px]">
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2 mb-4 max-h-[300px] overflow-y-auto">
                      {values.map((value) => {
                        const isSelected = selectedFilterValues.includes(value.id);
                        return (
                          <button
                            key={value.id}
                            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                              isSelected
                                ? 'border-red-600 bg-red-50 text-red-600'
                                : 'border-gray-200 hover:border-red-600 hover:bg-red-50 hover:text-red-600'
                            }`}
                            onClick={() => handleFilterValueToggle(value.id)}
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
                        onClick={() => toggleDropdown(`criteria-${criteria.id}`)}
                        className="bg-white hover:bg-gray-50"
                      >
                        Đóng
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApplyFilterCriteria(criteria.id)}
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
