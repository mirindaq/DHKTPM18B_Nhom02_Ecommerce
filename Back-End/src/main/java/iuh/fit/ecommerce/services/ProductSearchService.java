package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.elasticsearch.ProductDocument;

import java.util.List;

public interface ProductSearchService {
    ResponseWithPagination<List<ProductResponse>> searchProducts(
            String query,
            int page,
            int size,
            String sortBy
    );
    
    void indexProduct(Product product);
    
    void deleteProduct(Long productId);
    
    void reindexAllProducts();
}

