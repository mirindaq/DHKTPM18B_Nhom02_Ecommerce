package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.entities.ProductVariant;

import java.util.List;

public interface VectorStoreService {
    void indexProductVariant(ProductVariant productVariant);
    void deleteProductVariantIndex(Long productVariantId);
    List<String> searchSimilarProducts(String query, int topK);
}

