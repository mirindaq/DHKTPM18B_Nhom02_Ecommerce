import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { productService } from "@/services/product.service";
import { useQuery, useMutation } from "@/hooks";
import { ProductForm } from "./";
import type { CreateProductRequest, Product } from "@/types/product.type";

interface ProductPageWrapperProps {
  mode: "add" | "edit";
  title: string;
  description: string;
  successMessage: string;
  errorMessage: string;
  submitButtonText: string;
}

export default function ProductPageWrapper({
  mode,
  title,
  description,
  successMessage,
  errorMessage,
  submitButtonText,
}: ProductPageWrapperProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get product by ID (chỉ cho edit mode)
  const {
    data: productData,
    isLoading: isLoadingProduct,
    error: productError
  } = useQuery(
    () => productService.getProductById(productId),
    {
      queryKey: ["product", productId.toString()],
      enabled: mode === "edit" && !!productId
    }
  );

  const product = productData?.data;

  // Create product mutation (chỉ cho add mode)
  const createProductMutation = useMutation(
    (data: CreateProductRequest) => productService.createProduct(data),
    {
      onSuccess: () => {
        toast.success(successMessage);
        navigate("/admin/products");
      },
      onError: (error) => {
        console.error("Error creating product:", error);
        toast.error(errorMessage);
      }
    }
  );

  // Update product mutation (chỉ cho edit mode)
  const updateProductMutation = useMutation(
    (data: CreateProductRequest) => productService.updateProduct(productId, data),
    {
      onSuccess: () => {
        toast.success(successMessage);
        navigate("/admin/products");
      },
      onError: (error) => {
        console.error("Error updating product:", error);
        toast.error(errorMessage);
      }
    }
  );

  const handleFormSubmit = (data: CreateProductRequest) => {
    setIsSubmitting(true);
    if (mode === "add") {
      createProductMutation.mutate(data);
    } else {
      updateProductMutation.mutate(data);
    }
  };

  const handleCancel = () => {
    navigate("/admin/products");
  };

  // Loading state cho edit mode
  if (mode === "edit" && isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Đang tải thông tin sản phẩm...</span>
        </div>
      </div>
    );
  }

  // Error state cho edit mode
  if (mode === "edit" && (productError || !product)) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/products")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-gray-600 mb-4">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button onClick={() => navigate("/admin/products")}>
            Quay lại danh sách sản phẩm
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = isSubmitting || 
    (mode === "add" ? createProductMutation.isLoading : updateProductMutation.isLoading);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/products")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="text-base text-gray-600">
            {mode === "edit" && product ? (
              <>
                {description}: <span className="font-medium">{product.name}</span>
              </>
            ) : (
              description
            )}
          </p>
        </div>
      </div>

      {/* Form */}
      <div>
        <ProductForm
          product={mode === "edit" ? product : undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          submitButtonText={submitButtonText}
        />
      </div>
    </div>
  );
}
