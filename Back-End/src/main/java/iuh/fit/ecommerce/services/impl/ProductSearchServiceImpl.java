package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.ProductImage;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.entities.elasticsearch.ProductDocument;
import iuh.fit.ecommerce.mappers.ProductMapper;
import iuh.fit.ecommerce.repositories.ProductRepository;
import iuh.fit.ecommerce.repositories.elasticsearch.ProductSearchRepository;
import iuh.fit.ecommerce.services.ProductSearchService;
import iuh.fit.ecommerce.services.PromotionService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductSearchServiceImpl implements ProductSearchService {
    
    private static final Logger logger = LoggerFactory.getLogger(ProductSearchServiceImpl.class);
    
    private final ProductSearchRepository productSearchRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final ElasticsearchOperations elasticsearchOperations;
    private final PromotionService promotionService;

    @Override
    public ResponseWithPagination<List<ProductResponse>> searchProducts(
            String query,
            int page,
            int size,
            String sortBy
    ) {
        try {
            page = Math.max(page - 1, 0);
            
            // Xử lý sort
            Sort sort;
            if (sortBy != null && !sortBy.trim().isEmpty()) {
                switch (sortBy.toLowerCase()) {
                    case "price_asc":
                        sort = Sort.by("minPrice").ascending().and(Sort.by("productId").descending());
                        break;
                    case "price_desc":
                        sort = Sort.by("minPrice").descending().and(Sort.by("productId").descending());
                        break;
                    case "rating_asc":
                        sort = Sort.by("rating").ascending().and(Sort.by("productId").descending());
                        break;
                    case "rating_desc":
                        sort = Sort.by("rating").descending().and(Sort.by("productId").descending());
                        break;
                    default:
                        // Mặc định: rating desc, productId desc
                        sort = Sort.by("rating").descending().and(Sort.by("productId").descending());
                        break;
                }
            } else {
                // Mặc định: rating desc, productId desc
                sort = Sort.by("rating").descending().and(Sort.by("productId").descending());
            }
            
            Pageable pageable = PageRequest.of(page, size, sort);

            Criteria criteria = new Criteria("status").is(true);

            if (query != null && !query.trim().isEmpty()) {
                String searchText = query.trim().replace("\"", "");

                Criteria searchCriteria = new Criteria("name").matches(searchText)
                        .or("description").matches(searchText)
                        .or("searchableText").matches(searchText);

                criteria = criteria.subCriteria(searchCriteria);
            }

            Query searchQuery = new CriteriaQuery(criteria).setPageable(pageable);

            logger.debug("Executing Elasticsearch query: {}", criteria.toString());
            SearchHits<ProductDocument> searchHits = elasticsearchOperations.search(searchQuery, ProductDocument.class);

            // Copy lại phần return cũ:
            List<Long> productIds = searchHits.getSearchHits().stream()
                    .map(SearchHit::getContent)
                    .map(ProductDocument::getProductId)
                    .filter(id -> id != null)
                    .collect(Collectors.toList());

            logger.debug("Found {} product IDs from Elasticsearch: {}", productIds.size(), productIds);

            if (productIds.isEmpty()) {
                return ResponseWithPagination.<List<ProductResponse>>builder()
                        .data(new ArrayList<>())
                        .page(page + 1)
                        .limit(size)
                        .totalItem(0)
                        .totalPage(0)
                        .build();
            }

            List<Product> products = productRepository.findAllById(productIds);
            logger.debug("Found {} products from database for IDs: {}", products.size(), productIds);
            
            // Note: Status filtering is already done in Elasticsearch query, 
            // but we still need to verify products exist and are active
            // If product doesn't exist in DB, it means Elasticsearch index is out of sync
            if (products.size() < productIds.size()) {
                logger.warn("Some products from Elasticsearch not found in database. ES IDs: {}, DB found: {}", 
                    productIds, products.stream().map(Product::getId).collect(Collectors.toList()));
            }
            
            // Filter only active products (double check)
            products = products.stream()
                    .filter(p -> p.getStatus() != null && p.getStatus())
                    .collect(Collectors.toList());
            
            logger.debug("After filtering by status, {} products remaining", products.size());
            
            // Create a map for faster lookup
            java.util.Map<Long, Product> productMap = products.stream()
                    .collect(Collectors.toMap(Product::getId, p -> p, (p1, p2) -> p1));
            
            List<Product> orderedProducts = new ArrayList<>();
            for (Long id : productIds) {
                Product product = productMap.get(id);
                if (product != null) {
                    orderedProducts.add(product);
                }
            }
            
            // Nếu có query, luôn sắp xếp lại kết quả theo độ khớp với query trước
            // Sau đó mới áp dụng sortBy (price, rating) nếu có
            if (query != null && !query.trim().isEmpty() && !orderedProducts.isEmpty()) {
                String searchText = query.trim().toLowerCase();
                String[] queryWords = searchText.split("\\s+");
                
                orderedProducts.sort((p1, p2) -> {
                    // Tính điểm khớp cho cả name, description và searchableText
                    String name1 = (p1.getName() != null ? p1.getName() : "").toLowerCase();
                    String name2 = (p2.getName() != null ? p2.getName() : "").toLowerCase();
                    String desc1 = (p1.getDescription() != null ? p1.getDescription() : "").toLowerCase();
                    String desc2 = (p2.getDescription() != null ? p2.getDescription() : "").toLowerCase();
                    
                    // Tính điểm khớp tổng hợp (name có trọng số cao hơn)
                    int score1 = calculateRelevanceScore(name1, searchText, queryWords) * 10 
                               + calculateRelevanceScore(desc1, searchText, queryWords);
                    int score2 = calculateRelevanceScore(name2, searchText, queryWords) * 10 
                               + calculateRelevanceScore(desc2, searchText, queryWords);
                    
                    // Score cao hơn = khớp tốt hơn, nên sắp xếp giảm dần
                    int relevanceCompare = Integer.compare(score2, score1);
                    
                    // Nếu relevance bằng nhau, áp dụng sortBy nếu có
                    if (relevanceCompare == 0 && sortBy != null && !sortBy.trim().isEmpty()) {
                        String sortLower = sortBy.toLowerCase();
                        if (sortLower.equals("price_asc")) {
                            Double price1 = getMinPrice(p1);
                            Double price2 = getMinPrice(p2);
                            return Double.compare(price1 != null ? price1 : 0.0, price2 != null ? price2 : 0.0);
                        } else if (sortLower.equals("price_desc")) {
                            Double price1 = getMinPrice(p1);
                            Double price2 = getMinPrice(p2);
                            return Double.compare(price2 != null ? price2 : 0.0, price1 != null ? price1 : 0.0);
                        } else if (sortLower.equals("rating_desc")) {
                            Double rating1 = p1.getRating() != null ? p1.getRating() : 0.0;
                            Double rating2 = p2.getRating() != null ? p2.getRating() : 0.0;
                            return Double.compare(rating2, rating1);
                        } else if (sortLower.equals("rating_asc")) {
                            Double rating1 = p1.getRating() != null ? p1.getRating() : 0.0;
                            Double rating2 = p2.getRating() != null ? p2.getRating() : 0.0;
                            return Double.compare(rating1, rating2);
                        }
                    }
                    
                    return relevanceCompare;
                });
            } else if (sortBy != null && !sortBy.trim().isEmpty() && !orderedProducts.isEmpty()) {
                // Nếu không có query nhưng có sortBy, sắp xếp theo sortBy
                String sortLower = sortBy.toLowerCase();
                orderedProducts.sort((p1, p2) -> {
                    if (sortLower.equals("price_asc")) {
                        Double price1 = getMinPrice(p1);
                        Double price2 = getMinPrice(p2);
                        return Double.compare(price1 != null ? price1 : 0.0, price2 != null ? price2 : 0.0);
                    } else if (sortLower.equals("price_desc")) {
                        Double price1 = getMinPrice(p1);
                        Double price2 = getMinPrice(p2);
                        return Double.compare(price2 != null ? price2 : 0.0, price1 != null ? price1 : 0.0);
                    } else if (sortLower.equals("rating_desc")) {
                        Double rating1 = p1.getRating() != null ? p1.getRating() : 0.0;
                        Double rating2 = p2.getRating() != null ? p2.getRating() : 0.0;
                        return Double.compare(rating2, rating1);
                    } else if (sortLower.equals("rating_asc")) {
                        Double rating1 = p1.getRating() != null ? p1.getRating() : 0.0;
                        Double rating2 = p2.getRating() != null ? p2.getRating() : 0.0;
                        return Double.compare(rating1, rating2);
                    }
                    return 0;
                });
            }
            
            logger.debug("Final ordered products count: {}", orderedProducts.size());

            List<ProductResponse> productResponses = orderedProducts.stream()
                    .map(promotionService::addPromotionToProductResponseByProduct)
                    .collect(Collectors.toList());

            long totalItem = searchHits.getTotalHits();
            int totalPages = (int) Math.ceil((double) totalItem / size);

            return ResponseWithPagination.<List<ProductResponse>>builder()
                    .data(productResponses)
                    .page(page + 1)
                    .limit(size)
                    .totalItem(totalItem)
                    .totalPage(totalPages)
                    .build();

        } catch (Exception e) {
            logger.error("Error searching products in Elasticsearch: {}", e.getMessage(), e);
            throw new RuntimeException("Elasticsearch search failed: " + e.getMessage(), e);
        }
    }
    
    @Override
    public List<String> getAutoCompleteSuggestions(String query, int limit) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return new ArrayList<>();
            }
            
            String searchText = query.trim().toLowerCase();
            limit = Math.min(Math.max(limit, 1), 10); // Limit between 1-10
            
            // Tìm products có name chứa query (toàn bộ hoặc một phần)
            // Sử dụng wildcard để tìm các tên bắt đầu với query
            Criteria criteria = new Criteria("status").is(true)
                .and(
                    new Criteria("name").matches(searchText)
                        .or(new Criteria("name").matches(searchText + "*"))
                );
            
            Pageable pageable = PageRequest.of(0, limit * 3); // Lấy nhiều hơn để filter và sắp xếp sau
            Query searchQuery = new CriteriaQuery(criteria)
                .setPageable(pageable)
                .addSort(Sort.by("rating").descending());
            
            SearchHits<ProductDocument> searchHits = elasticsearchOperations.search(
                searchQuery, 
                ProductDocument.class
            );
            
            // Phân loại suggestions theo độ khớp:
            // 1. Bắt đầu với toàn bộ query (exact prefix match) - ưu tiên cao nhất
            // 2. Chứa toàn bộ query như một cụm từ (phrase match) - ưu tiên cao
            // 3. Chứa tất cả các từ trong query (all words match) - ưu tiên trung bình
            // 4. Chứa một phần query - ưu tiên thấp
            List<String> exactStartsWith = new ArrayList<>(); // Bắt đầu với toàn bộ query
            List<String> phraseContains = new ArrayList<>(); // Chứa toàn bộ query như cụm từ
            List<String> allWordsMatch = new ArrayList<>(); // Chứa tất cả các từ
            List<String> partialMatch = new ArrayList<>(); // Chứa một phần
            
            String[] queryWords = searchText.split("\\s+");
            
            for (SearchHit<ProductDocument> hit : searchHits.getSearchHits()) {
                String name = hit.getContent().getName();
                if (name == null || name.isEmpty()) {
                    continue;
                }
                
                String lowerName = name.toLowerCase();
                
                // Kiểm tra độ khớp và phân loại
                if (lowerName.startsWith(searchText)) {
                    // Bắt đầu với toàn bộ query - ưu tiên cao nhất
                    if (!exactStartsWith.contains(name)) {
                        exactStartsWith.add(name);
                    }
                } else if (lowerName.contains(searchText)) {
                    // Chứa toàn bộ query như một cụm từ - ưu tiên cao
                    if (!phraseContains.contains(name)) {
                        phraseContains.add(name);
                    }
                } else {
                    // Kiểm tra xem có chứa tất cả các từ không
                    boolean containsAllWords = true;
                    for (String word : queryWords) {
                        if (!lowerName.contains(word)) {
                            containsAllWords = false;
                            break;
                        }
                    }
                    
                    if (containsAllWords) {
                        // Chứa tất cả các từ - ưu tiên trung bình
                        if (!allWordsMatch.contains(name)) {
                            allWordsMatch.add(name);
                        }
                    } else {
                        // Chỉ chứa một phần - ưu tiên thấp
                        boolean hasAnyWord = false;
                        for (String word : queryWords) {
                            if (lowerName.contains(word)) {
                                hasAnyWord = true;
                                break;
                            }
                        }
                        if (hasAnyWord && !partialMatch.contains(name)) {
                            partialMatch.add(name);
                        }
                    }
                }
            }
            
            // Kết hợp theo thứ tự ưu tiên
            List<String> suggestions = new ArrayList<>();
            suggestions.addAll(exactStartsWith);
            suggestions.addAll(phraseContains);
            suggestions.addAll(allWordsMatch);
            suggestions.addAll(partialMatch);
            
            return suggestions.stream()
                .distinct()
                .limit(limit)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            logger.error("Error getting auto complete suggestions: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    @Override
    @Transactional
    public void indexProduct(Product product) {
        // Reload product with all relationships
        Product fullProduct = productRepository.findById(product.getId())
            .orElse(product);
        
        // Force load all lazy relationships
        if (fullProduct.getProductVariants() != null) {
            fullProduct.getProductVariants().forEach(variant -> {
                if (variant.getProductVariantValues() != null) {
                    variant.getProductVariantValues().forEach(pvv -> {
                        if (pvv.getVariantValue() != null) {
                            pvv.getVariantValue().getValue(); // Force load
                        }
                    });
                }
            });
        }
        if (fullProduct.getAttributes() != null) {
            fullProduct.getAttributes().forEach(attr -> {
                if (attr.getAttribute() != null) {
                    attr.getAttribute().getName(); // Force load
                }
            });
        }
        if (fullProduct.getProductFilterValues() != null) {
            fullProduct.getProductFilterValues().forEach(pfv -> {
                if (pfv.getFilterValue() != null) {
                    pfv.getFilterValue().getValue(); // Force load
                }
            });
        }
        if (fullProduct.getProductImages() != null) {
            fullProduct.getProductImages().size(); // Force load
        }
        
        ProductDocument document = convertToDocument(fullProduct);
        productSearchRepository.save(document);
    }

    @Override
    public void deleteProduct(Long productId) {
        productSearchRepository.deleteById(String.valueOf(productId));
    }

    @Override
    @Transactional
    public void reindexAllProducts() {
        // Delete all existing documents
        try {
            productSearchRepository.deleteAll();
        } catch (Exception e) {
            // Ignore if index doesn't exist yet
        }
        // Index all products - load with all relationships
        List<Product> products = productRepository.findAll();
        List<ProductDocument> documents = new ArrayList<>();
        
        for (Product product : products) {
            try {
                // Force load all lazy relationships by accessing them
                if (product.getProductVariants() != null) {
                    product.getProductVariants().forEach(variant -> {
                        if (variant.getProductVariantValues() != null) {
                            variant.getProductVariantValues().size(); // Force load
                        }
                    });
                }
                if (product.getAttributes() != null) {
                    product.getAttributes().size(); // Force load
                }
                if (product.getProductFilterValues() != null) {
                    product.getProductFilterValues().forEach(pfv -> {
                        if (pfv.getFilterValue() != null) {
                            pfv.getFilterValue().getValue();
                        }
                    });
                }
                if (product.getProductImages() != null) {
                    product.getProductImages().size();
                }
                
                ProductDocument document = convertToDocument(product);
                documents.add(document);
            } catch (Exception e) {
                System.err.println("Error indexing product ID " + product.getId() + ": " + e.getMessage());
            }
        }
        
        // Save in batches to avoid memory issues
        if (!documents.isEmpty()) {
            productSearchRepository.saveAll(documents);
        }
    }
    
    /**
     * Tính điểm khớp của text với query tìm kiếm
     * Điểm càng cao = khớp càng tốt
     */
    private int calculateRelevanceScore(String text, String fullQuery, String[] queryWords) {
        if (text == null || text.isEmpty()) {
            return 0;
        }
        
        int score = 0;
        
        // Ưu tiên cao nhất: text chứa đầy đủ cụm từ tìm kiếm (exact phrase match)
        if (text.contains(fullQuery)) {
            score += 1000;
        }
        
        // Ưu tiên cao: text bắt đầu với query
        if (text.startsWith(fullQuery)) {
            score += 500;
        }
        
        // Đếm số từ trong query có trong text
        int matchedWords = 0;
        for (String word : queryWords) {
            if (text.contains(word)) {
                matchedWords++;
                // Ưu tiên các từ dài hơn
                score += word.length() * 10;
            }
        }
        
        // Ưu tiên các text có nhiều từ khớp hơn
        score += matchedWords * 50;
        
        // Ưu tiên các text có tỷ lệ từ khớp cao hơn
        if (queryWords.length > 0) {
            double matchRatio = (double) matchedWords / queryWords.length;
            score += (int) (matchRatio * 100);
        }
        
        return score;
    }
    
    /**
     * Lấy giá nhỏ nhất của sản phẩm từ variants
     */
    private Double getMinPrice(Product product) {
        if (product.getProductVariants() == null || product.getProductVariants().isEmpty()) {
            return null;
        }
        return product.getProductVariants().stream()
                .filter(v -> v.getPrice() != null)
                .map(ProductVariant::getPrice)
                .min(Double::compareTo)
                .orElse(null);
    }
    
    private ProductDocument convertToDocument(Product product) {
        // Calculate min and max prices from variants, and total stock
        Double minPrice = null;
        Double maxPrice = null;
        Integer totalStock = 0;
        List<String> variantSkus = new ArrayList<>();
        List<String> variantValues = new ArrayList<>();
        
        if (product.getProductVariants() != null && !product.getProductVariants().isEmpty()) {
            List<Double> prices = new ArrayList<>();
            
            for (ProductVariant variant : product.getProductVariants()) {
                // Collect prices
                if (variant.getPrice() != null) {
                    prices.add(variant.getPrice());
                }
                
                // Sum up stock from all variants
                if (variant.getStock() != null) {
                    totalStock += variant.getStock();
                }
                
                // Collect SKUs
                if (variant.getSku() != null && !variant.getSku().isEmpty()) {
                    variantSkus.add(variant.getSku());
                }
                
                // Collect variant values (e.g., "Red", "Large", "128GB")
                if (variant.getProductVariantValues() != null) {
                    for (var pvv : variant.getProductVariantValues()) {
                        if (pvv.getVariantValue() != null) {
                            String variantValue = pvv.getVariantValue().getValue();
                            if (variantValue != null && !variantValue.isEmpty()) {
                                variantValues.add(variantValue);
                            }
                        }
                    }
                }
            }
            
            if (!prices.isEmpty()) {
                minPrice = prices.stream().min(Double::compareTo).orElse(null);
                maxPrice = prices.stream().max(Double::compareTo).orElse(null);
            }
        }
        
        // Get product images
        List<String> imageUrls = new ArrayList<>();
        if (product.getProductImages() != null) {
            imageUrls = product.getProductImages().stream()
                .map(ProductImage::getUrl)
                .filter(url -> url != null && !url.isEmpty())
                .collect(Collectors.toList());
        }
        
        // Collect attribute names and values
        List<String> attributeNames = new ArrayList<>();
        List<String> attributeValues = new ArrayList<>();
        if (product.getAttributes() != null) {
            for (var attrValue : product.getAttributes()) {
                if (attrValue.getAttribute() != null && attrValue.getAttribute().getName() != null) {
                    attributeNames.add(attrValue.getAttribute().getName());
                }
                if (attrValue.getValue() != null && !attrValue.getValue().isEmpty()) {
                    attributeValues.add(attrValue.getValue());
                }
            }
        }

        // Collect filter values
        List<String> filterValues = new ArrayList<>();
        if (product.getProductFilterValues() != null) {
            for (var pfv : product.getProductFilterValues()) {
                if (pfv.getFilterValue() != null && pfv.getFilterValue().getValue() != null) {
                    filterValues.add(pfv.getFilterValue().getValue());
                }
            }
        }

        // Build searchable text - include all searchable content
        List<String> searchableText = new ArrayList<>();
        if (product.getName() != null) {
            searchableText.add(product.getName());
        }
        if (product.getDescription() != null) {
            searchableText.add(product.getDescription());
        }
        if (product.getBrand() != null && product.getBrand().getName() != null) {
            searchableText.add(product.getBrand().getName());
        }
        if (product.getCategory() != null && product.getCategory().getName() != null) {
            searchableText.add(product.getCategory().getName());
        }

        searchableText.addAll(variantValues);

        searchableText.addAll(attributeValues);

        searchableText.addAll(filterValues);

        searchableText.addAll(variantSkus);
        
        return ProductDocument.builder()
            .id(String.valueOf(product.getId()))
            .productId(product.getId())
            .name(product.getName())
            .slug(product.getSlug())
            .description(product.getDescription())
            .thumbnail(product.getThumbnail())
            .rating(product.getRating())
            .stock(totalStock)
            .status(product.getStatus())
            .spu(product.getSpu())
            .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
            .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
            .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
            .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
            .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
            .productImages(imageUrls)
            .minPrice(minPrice)
            .maxPrice(maxPrice)
            .searchableText(searchableText)
            .variantSkus(variantSkus)
            .variantValues(variantValues)
            .attributeNames(attributeNames)
            .attributeValues(attributeValues)
            .filterValues(filterValues)
            .build();
    }
}