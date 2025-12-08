import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectedItem {
  id: number;
  name: string;
  thumbnail?: string;
  image?: string;
  sku?: string;
}

interface SelectedItemsDisplayProps {
  items: SelectedItem[];
  onRemove: (id: number) => void;
  itemType: "category" | "brand" | "product" | "variant";
  emptyMessage?: string;
}

export default function SelectedItemsDisplay({
  items,
  onRemove,
  itemType,
  emptyMessage,
}: SelectedItemsDisplayProps) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <p className="text-gray-500 text-sm">
          {emptyMessage || "Chưa có mục nào được chọn"}
        </p>
      </div>
    );
  }

  const getItemIcon = () => {
    switch (itemType) {
      case "category":
        return "📁";
      case "brand":
        return "🏷️";
      case "product":
        return "📦";
      case "variant":
        return "🔧";
      default:
        return "✓";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          Đã chọn {items.length} {itemType === "category" ? "danh mục" : itemType === "brand" ? "thương hiệu" : itemType === "product" ? "sản phẩm" : "biến thể"}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            {(item.thumbnail || item.image) ? (
              <img
                src={item.thumbnail || item.image}
                alt={item.name}
                className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-lg border-2 border-blue-200">
                {getItemIcon()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {item.name}
              </p>
              {item.sku && (
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  SKU: {item.sku}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

