package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.product.ProductAddRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;

import java.util.List;

public interface ProductService {
    ProductResponse createProduct(ProductAddRequest productAddRequest);
    ResponseWithPagination<List<ProductResponse>> getAllProducts(int page, int size);
    ProductResponse getProductById(Long id);
    ProductResponse updateProductById(Long id);
}
