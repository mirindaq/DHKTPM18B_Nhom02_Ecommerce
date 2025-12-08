import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useDebounce } from "@/hooks";
import { categoryService } from "@/services/category.service";
import { Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySearchSelectorProps {
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

export default function CategorySearchSelector({
  selectedIds,
  onSelectionChange,
}: CategorySearchSelectorProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchKeyword, 500);

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery(
    () => categoryService.getCategories(1, 100, debouncedSearch),
    {
      queryKey: ["categories-search", debouncedSearch],
    }
  );

  const categories = categoriesData?.data?.data || [];

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleToggleCategory = (categoryId: number) => {
    const isSelected = selectedIds.includes(categoryId);
    const newIds = isSelected
      ? selectedIds.filter((id) => id !== categoryId)
      : [...selectedIds, categoryId];
    onSelectionChange(newIds);
  };

  const selectedCategories = categories.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="space-y-4">
      <div className="relative" ref={dropdownRef}>
        <Label className="text-base font-medium mb-2 block">
          Tìm kiếm và chọn danh mục
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Nhập tên danh mục để tìm kiếm..."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className="h-12 pl-10 pr-10"
            disabled={isLoadingCategories}
          />
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                isDropdownOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {isLoadingCategories ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Đang tải...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">
                  {searchKeyword
                    ? "Không tìm thấy danh mục"
                    : "Không có danh mục"}
                </p>
              </div>
            ) : (
              <div className="py-1 max-h-80 overflow-y-auto">
                {categories.map((category) => {
                  const isSelected = selectedIds.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleToggleCategory(category.id)}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 p-3 hover:bg-blue-50 transition-colors text-left",
                        isSelected && "bg-blue-50"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-medium text-sm line-clamp-1",
                            isSelected ? "text-blue-600" : "text-gray-900"
                          )}
                        >
                          {category.name}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected categories */}
      {selectedCategories.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">
            Đã chọn {selectedCategories.length} danh mục
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-300 rounded-md text-sm text-blue-700 font-medium"
              >
                {category.name}
                <button
                  type="button"
                  onClick={() => handleToggleCategory(category.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

