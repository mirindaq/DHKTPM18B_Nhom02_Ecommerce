import { useState, useRef } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
  variant?: "default" | "thumbnail" | "product";
  placeholder?: string;
  description?: string;
}

export default function FileUpload({
  onFilesSelected,
  accept = "image/*",
  multiple = true,
  disabled = false,
  maxFiles = 10,
  maxSize = 10,
  className = "",
  variant = "default",
  placeholder = "Nhấp để chọn hoặc kéo thả file vào đây",
  description = "PNG, JPG, GIF tối đa 10MB",
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getVariantStyles = () => {
    switch (variant) {
      case "thumbnail":
        return {
          borderColor: isDragOver ? "border-blue-400" : "border-gray-300",
          bgColor: isDragOver ? "bg-blue-50" : "hover:bg-blue-50",
          iconBg: "bg-gray-100 group-hover:bg-blue-100",
          iconColor: "text-gray-400 group-hover:text-blue-500",
          textColor: "text-blue-600 group-hover:text-blue-700",
        };
      case "product":
        return {
          borderColor: isDragOver ? "border-green-400" : "border-gray-300",
          bgColor: isDragOver ? "bg-green-50" : "hover:bg-green-50",
          iconBg: "bg-gray-100 group-hover:bg-green-100",
          iconColor: "text-gray-400 group-hover:text-green-500",
          textColor: "text-green-600 group-hover:text-green-700",
        };
      default:
        return {
          borderColor: isDragOver ? "border-gray-400" : "border-gray-300",
          bgColor: isDragOver ? "bg-gray-50" : "hover:bg-gray-50",
          iconBg: "bg-gray-100 group-hover:bg-gray-200",
          iconColor: "text-gray-400 group-hover:text-gray-500",
          textColor: "text-gray-600 group-hover:text-gray-700",
        };
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "product":
        return <ImageIcon className="h-8 w-8" />;
      default:
        return <Upload className="h-6 w-6" />;
    }
  };

  const getPadding = () => {
    switch (variant) {
      case "product":
        return "p-8";
      default:
        return "p-6";
    }
  };

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    
    for (const file of files) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        console.warn(`File ${file.name} is too large. Max size: ${maxSize}MB`);
        continue;
      }
      
      // Check file type
      if (accept && !file.type.match(accept.replace(/\*/g, ".*"))) {
        console.warn(`File ${file.name} is not a valid type. Accept: ${accept}`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    // Limit to maxFiles
    const limitedFiles = validFiles.slice(0, maxFiles);
    
    // Show warning if files were limited
    if (validFiles.length > maxFiles) {
      console.warn(`Only ${maxFiles} files allowed. ${validFiles.length - maxFiles} files were ignored.`);
    }
    
    return limitedFiles;
  };

  const handleFiles = (files: File[]) => {
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
    
    // Reset input value to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg text-center cursor-pointer group
        transition-all duration-200
        ${styles.borderColor} ${styles.bgColor}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
      
      <div className={`flex flex-col items-center space-y-${variant === "product" ? "3" : "2"} ${getPadding()}`}>
        <div className={`p-${variant === "product" ? "4" : "3"} rounded-full transition-colors ${styles.iconBg}`}>
          <div className={styles.iconColor}>
            {getIcon()}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-sm text-gray-600">
            <span className={`font-medium ${styles.textColor}`}>
              {placeholder.split(" ")[0]}
            </span>{" "}
            {placeholder.split(" ").slice(1).join(" ")}
          </div>
          <p className="text-xs text-gray-500">
            {description}
          </p>
          {maxFiles === 1 && (
            <p className="text-xs text-orange-500 font-medium">
              Chỉ được chọn 1 file
            </p>
          )}
          {maxFiles > 1 && (
            <p className="text-xs text-gray-400">
              Tối đa {maxFiles} files
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
