package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.product.ProductAddRequest;
import iuh.fit.ecommerce.dtos.request.product.ProductVariantPromotionRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.dtos.response.product.ProductVariantPromotionResponse;
import iuh.fit.ecommerce.entities.Product;

import java.util.List;
import java.util.Map;

public interface ProductService {
    void createProduct(ProductAddRequest productAddRequest);
    ResponseWithPagination<List<ProductResponse>> getAllProducts(int page, int size, String keyword, Long brandId, Long categoryId, Boolean status, Double minPrice, Double maxPrice);
    ProductResponse getProductById(Long id);
    ProductResponse getProductBySlug(String slug);
    ProductResponse updateProductById(Long id);

    Product getProductEntityById(Long id);

    Product getProductEntityBySlug(String slug);

    ResponseWithPagination<List<ProductResponse>> searchProductForUser(String categorySlug, int page, int size, Map<String, String> filters);
}
