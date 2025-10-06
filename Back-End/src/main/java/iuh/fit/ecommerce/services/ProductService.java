package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.product.ProductAddRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;

import java.util.List;

public interface ProductService {
    void createProduct(ProductAddRequest productAddRequest);
    ResponseWithPagination<List<ProductResponse>> getAllProducts(int page, int size);
    ProductResponse getProductById(Long id);
    ProductResponse getProductBySlug(String slug);
    ProductResponse updateProductById(Long id);
}
