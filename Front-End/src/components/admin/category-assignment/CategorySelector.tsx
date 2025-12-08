import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types/category.type";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  isLoading?: boolean;
}

export default function CategorySelector({
  categories,
  selectedCategoryId,
  onCategoryChange,
  isLoading,
}: CategorySelectorProps) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="category-select">Chọn Danh mục</Label>
      <Select
        onValueChange={(value) =>
          onCategoryChange(value ? Number(value) : null)
        }
        value={selectedCategoryId ? String(selectedCategoryId) : ""}
        disabled={isLoading}
      >
        <SelectTrigger id="category-select">
          <SelectValue placeholder="-- Chọn một danh mục --" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={String(category.id)}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

