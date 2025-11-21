import { Button } from '@/components/ui/button';
import { Star, ArrowUp, ArrowDown } from 'lucide-react';

type SortOption = 'popular' | 'price_asc' | 'price_desc';

interface SortSectionProps {
  sortBy?: SortOption;
  onSortChange?: (sortBy: SortOption) => void;
}

export default function SortSection({ sortBy = 'popular', onSortChange }: SortSectionProps) {
  const sortOptions: { value: SortOption; label: string; icon: any }[] = [
    { value: 'popular', label: 'Phổ biến', icon: Star },
    { value: 'price_asc', label: 'Giá Thấp - Cao', icon: ArrowUp },
    { value: 'price_desc', label: 'Giá Cao - Thấp', icon: ArrowDown },
  ];

  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="text-sm font-semibold text-gray-900">Sắp xếp theo</span>
      <div className="flex items-center gap-2">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = sortBy === option.value;
          
          return (
            <Button
              key={option.value}
              variant="outline"
              onClick={() => onSortChange?.(option.value)}
              className={
                isSelected
                  ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600'
              }
            >
              <Icon size={16} className="mr-2" />
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

