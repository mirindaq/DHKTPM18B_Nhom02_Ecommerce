import { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import ProductCard from "@/components/user/ProductCard";
import { Loader2 } from "lucide-react";
import type { Product } from "@/types/product.type";

interface FeaturedProductsSectionProps {
  title?: string;
  limit?: number;
}

export default function FeaturedProductsSection({
  title = "Sản phẩm nổi bật",
  limit = 8,
}: FeaturedProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getProducts(1, limit, {});
        setProducts(response.data.data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm nổi bật:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [limit]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
