package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.services.VectorStoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VectorStoreServiceImpl implements VectorStoreService {

    private final VectorStore vectorStore;
    private final EmbeddingModel embeddingModel;

    @Override
    public void indexProductVariant(ProductVariant productVariant) {
        // Xây dựng text để embed
        String text = buildProductVariantText(productVariant);

        // Tạo document với metadata
        Document doc = Document.builder()
                .text(text)
                .id(UUID.nameUUIDFromBytes(
                        String.valueOf(productVariant.getId()).getBytes()
                ).toString())
                .metadata(Map.of(
                        "productVariantId", productVariant.getId(),
                        "productId", productVariant.getProduct().getId(),
                        "productName", productVariant.getProduct().getName(),
                        "brandName", productVariant.getProduct().getBrand().getName(),
                        "categoryName", productVariant.getProduct().getCategory().getName(),
                        "price", productVariant.getPrice(),
                        "sku", productVariant.getSku() != null ? productVariant.getSku() : "",
                        "stock", productVariant.getStock()
                ))
                .build();

        // Add to vector store
        vectorStore.add(List.of(doc));
    }

    @Override
    public void deleteProductVariantIndex(Long productVariantId) {
        String docId = UUID.nameUUIDFromBytes(
                String.valueOf(productVariantId).getBytes()
        ).toString();
        vectorStore.delete(List.of(docId));
    }

    @Override
    public List<String> searchSimilarProducts(String query, int topK) {
        SearchRequest request = SearchRequest.builder()
                .query(query)
                .topK(topK)
                .build();

        List<Document> retrievedDocs = vectorStore.similaritySearch(request);

        // Format kết quả thành string để đưa vào prompt
        return retrievedDocs.stream()
                .map(doc -> {
                    Map<String, Object> metadata = doc.getMetadata();
                    return String.format(
                            "Sản phẩm: %s\n" +
                            "Thương hiệu: %s\n" +
                            "Danh mục: %s\n" +
                            "Giá: %,.0fđ\n" +
                            "SKU: %s\n" +
                            "Tồn kho: %d\n" +
                            "Mô tả: %s",
                            metadata.get("productName"),
                            metadata.get("brandName"),
                            metadata.get("categoryName"),
                            ((Number) metadata.get("price")).doubleValue(),
                            metadata.get("sku"),
                            ((Number) metadata.get("stock")).intValue(),
                            doc.getFormattedContent()
                    );
                })
                .collect(Collectors.toList());
    }

    private String buildProductVariantText(ProductVariant productVariant) {
        StringBuilder text = new StringBuilder();
        
        Product product = productVariant.getProduct();
        
        // Tên sản phẩm
        text.append("Tên sản phẩm: ").append(product.getName()).append("\n");
        
        // Thương hiệu
        text.append("Thương hiệu: ").append(product.getBrand().getName()).append("\n");
        
        // Danh mục
        text.append("Danh mục: ").append(product.getCategory().getName()).append("\n");
        
        // Giá
        text.append("Giá: ").append(String.format("%,.0fđ", productVariant.getPrice())).append("\n");
        
        // SKU
        if (productVariant.getSku() != null && !productVariant.getSku().isEmpty()) {
            text.append("Mã sản phẩm: ").append(productVariant.getSku()).append("\n");
        }
        
        // Mô tả sản phẩm (nếu có)
        if (product.getDescription() != null && !product.getDescription().isEmpty()) {
            text.append("Mô tả: ").append(product.getDescription()).append("\n");
        }
        
        // Thuộc tính biến thể (nếu có)
        if (productVariant.getProductVariantValues() != null && !productVariant.getProductVariantValues().isEmpty()) {
            text.append("Thuộc tính: ");
            String attributes = productVariant.getProductVariantValues().stream()
                    .map(pvv -> pvv.getVariantValue().getValue())
                    .collect(Collectors.joining(", "));
            text.append(attributes).append("\n");
        }
        
        return text.toString();
    }
}

