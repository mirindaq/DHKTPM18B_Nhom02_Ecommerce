import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImagePreviewGridProps {
  images: string[];
  onRemove: (index: number) => void;
  disabled?: boolean;
  title?: string;
  showCounter?: boolean;
  variant?: "default" | "thumbnail" | "product";
  className?: string;
}

export default function ImagePreviewGrid({
  images,
  onRemove,
  disabled = false,
  title,
  showCounter = true,
  variant = "default",
  className = "",
}: ImagePreviewGridProps) {
  if (images.length === 0) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "thumbnail":
        return {
          borderColor: "border-gray-200 hover:border-blue-400",
          gridCols: "grid-cols-4 sm:grid-cols-6 md:grid-cols-8",
          statusColor: "bg-blue-500",
          statusText: "text-blue-600",
        };
      case "product":
        return {
          borderColor: "border-gray-200 hover:border-green-400",
          gridCols: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
          statusColor: "bg-green-500",
          statusText: "text-green-600",
        };
      default:
        return {
          borderColor: "border-gray-200 hover:border-gray-400",
          gridCols: "grid-cols-4 sm:grid-cols-6 md:grid-cols-8",
          statusColor: "bg-gray-500",
          statusText: "text-gray-600",
        };
    }
  };

  const styles = getVariantStyles();

  const getTitle = () => {
    if (title) return title;
    
    switch (variant) {
      case "thumbnail":
        return `Hình ảnh đã chọn (${images.length})`;
      case "product":
        return `Hình ảnh sản phẩm (${images.length})`;
      default:
        return `Hình ảnh (${images.length})`;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">
          {getTitle()}
        </Label>
        {showCounter && (
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${styles.statusColor}`}></div>
            <span className={`text-xs font-medium ${styles.statusText}`}>
              Đã chọn {images.length} hình ảnh
            </span>
          </div>
        )}
      </div>
      
      <div className={`grid ${styles.gridCols} gap-3`}>
        {images.map((url, index) => (
          <div key={index} className="relative group">
            <div className={`
              aspect-square rounded-lg overflow-hidden border-2 
              transition-all duration-200 shadow-sm hover:shadow-md
              ${styles.borderColor}
            `}>
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemove(index)}
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 text-white hover:bg-red-600 border-0 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
            
            {variant === "product" && (
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                #{index + 1}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
