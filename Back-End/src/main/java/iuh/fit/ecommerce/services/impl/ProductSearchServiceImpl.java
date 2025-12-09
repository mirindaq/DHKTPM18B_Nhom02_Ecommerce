package iuh.fit.ecommerce.services.impl;

import co.elastic.clients.elasticsearch._types.FieldSort;
import co.elastic.clients.elasticsearch._types.SortOptions;
import co.elastic.clients.elasticsearch._types.SortOrder;
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
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.client.elc.NativeQueryBuilder;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.data.elasticsearch.core.query.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.TextQueryType;
import co.elastic.clients.elasticsearch._types.query_dsl.Operator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
            boolean hasQuery = query != null && !query.trim().isEmpty();
            boolean hasCustomSort = sortBy != null && !sortBy.isBlank();

            // -----------------------------
            // Xử lý sort
            // -----------------------------
            List<SortOptions> sortOptionsList = new ArrayList<>();

            if (hasCustomSort) {
                // Nếu có sortBy cụ thể, chỉ dùng sortBy đó
                switch (sortBy.toLowerCase()) {
                    case "price_asc":
                        sortOptionsList.add(SortOptions.of(s -> s
                                .field(FieldSort.of(f -> f
                                        .field("minPrice")
                                        .order(SortOrder.Asc)
                                ))
                        ));
                        break;
                    case "price_desc":
                        sortOptionsList.add(SortOptions.of(s -> s
                                .field(FieldSort.of(f -> f
                                        .field("minPrice")
                                        .order(SortOrder.Desc)
                                ))
                        ));
                        break;
                    case "rating_asc":
                        sortOptionsList.add(SortOptions.of(s -> s
                                .field(FieldSort.of(f -> f
                                        .field("rating")
                                        .order(SortOrder.Asc)
                                ))
                        ));
                        break;
                    case "rating_desc":
                        sortOptionsList.add(SortOptions.of(s -> s
                                .field(FieldSort.of(f -> f
                                        .field("rating")
                                        .order(SortOrder.Desc)
                                ))
                        ));
                        break;
                    default:
                        // Nếu sortBy không hợp lệ, dùng mặc định
                        if (hasQuery) {
                            sortOptionsList.add(SortOptions.of(s -> s.score(sc -> sc.order(SortOrder.Desc))));
                        }
                        sortOptionsList.add(SortOptions.of(s -> s
                                .field(FieldSort.of(f -> f
                                        .field("rating")
                                        .order(SortOrder.Desc)
                                ))
                        ));
                        break;
                }
                
                // Nếu có query và sortBy, thêm _score làm secondary sort để giữ relevance
                if (hasQuery && !sortBy.toLowerCase().equals("price_asc") && !sortBy.toLowerCase().equals("price_desc")) {
                    sortOptionsList.add(SortOptions.of(s -> s.score(sc -> sc.order(SortOrder.Desc))));
                }
            } else {
                // Không có sortBy cụ thể
                if (hasQuery) {
                    // Có query: ưu tiên relevance score
                    sortOptionsList.add(SortOptions.of(s -> s.score(sc -> sc.order(SortOrder.Desc))));
                }
                // Luôn thêm rating làm secondary sort
                sortOptionsList.add(SortOptions.of(s -> s
                        .field(FieldSort.of(f -> f
                                .field("rating")
                                .order(SortOrder.Desc)
                        ))
                ));
            }

            // -----------------------------
            // Build Native Query
            // -----------------------------
            NativeQueryBuilder queryBuilder = NativeQuery.builder()
                    .withPageable(PageRequest.of(page, size))
                    .withQuery(q -> q
                            .bool(b -> {
                                // status = true
                                b.must(m -> m
                                        .term(t -> t
                                                .field("status")
                                                .value(true)
                                        )
                                );

                                // search user query
                                if (hasQuery) {
                                    String cleaned = query.trim().replaceAll("[\"*?/\\\\<>]", " ");
                                    
                                    // Sử dụng should với nhiều loại query để tăng độ chính xác
                                    b.should(s -> s
                                            // Exact phrase match - ưu tiên cao nhất
                                            .matchPhrase(mp -> mp
                                                    .field("name")
                                                    .query(cleaned)
                                                    .boost(10.0f)
                                            )
                                    );
                                    
                                    b.should(s -> s
                                            // Prefix match trên name - ưu tiên cao
                                            .prefix(p -> p
                                                    .field("name")
                                                    .value(cleaned.toLowerCase())
                                                    .boost(8.0f)
                                            )
                                    );
                                    
                                    b.should(s -> s
                                            // Multi-match với boost cho name
                                            .multiMatch(mm -> mm
                                                    .query(cleaned)
                                                    .fields("name^5", "description^2", "searchableText^1")
                                                    .type(TextQueryType.BestFields)
                                                    .operator(Operator.Or)
                                                    .fuzziness("AUTO")
                                                    .minimumShouldMatch("50%")
                                                    .boost(5.0f)
                                            )
                                    );
                                    
                                    // Match tất cả các từ trong query
                                    String[] words = cleaned.split("\\s+");
                                    if (words.length > 1) {
                                        b.should(s -> s
                                                .multiMatch(mm -> mm
                                                        .query(cleaned)
                                                        .fields("name^3", "description^1", "searchableText^1")
                                                        .type(TextQueryType.CrossFields)
                                                        .operator(Operator.And)
                                                        .boost(3.0f)
                                                )
                                        );
                                    }
                                    
                                    // Minimum should match: ít nhất 1 should clause phải match
                                    b.minimumShouldMatch("1");
                                }

                                return b;
                            })
                    );
            
            // Thêm sort options vào query builder
            if (!sortOptionsList.isEmpty()) {
                queryBuilder.withSort(sortOptionsList);
            }

            NativeQuery searchQuery = queryBuilder.build();

            logger.debug("Executing Elasticsearch query: {}", searchQuery.getQuery());
            logger.debug("Sort options count: {}", sortOptionsList.size());

            // -----------------------------
            // Execute
            // -----------------------------
            SearchHits<ProductDocument> searchHits =
                    elasticsearchOperations.search(searchQuery, ProductDocument.class);

            List<Long> productIds = searchHits
                    .getSearchHits()
                    .stream()
                    .map(hit -> hit.getContent().getProductId())
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());

            logger.debug("Found {} product IDs from Elasticsearch", productIds.size());

            if (productIds.isEmpty()) {
                return ResponseWithPagination.<List<ProductResponse>>builder()
                        .data(new ArrayList<>())
                        .page(page + 1)
                        .limit(size)
                        .totalItem(0)
                        .totalPage(0)
                        .build();
            }

            // -----------------------------
            // Lấy dữ liệu từ DB (giữ nguyên thứ tự từ Elasticsearch)
            // -----------------------------
            List<Product> found = productRepository.findAllById(productIds);

            Map<Long, Product> map = found.stream()
                    .filter(p -> p.getStatus() != null && p.getStatus())
                    .collect(Collectors.toMap(Product::getId, p -> p, (p1, p2) -> p1));

            // Giữ nguyên thứ tự từ Elasticsearch
            List<Product> ordered = new ArrayList<>();
            for (Long id : productIds) {
                Product product = map.get(id);
                if (product != null) {
                    ordered.add(product);
                }
            }

            // Nếu có query và không có sortBy cụ thể, sắp xếp lại theo relevance
            if (hasQuery && !hasCustomSort && ordered.size() > 1) {
                String searchText = query.trim().toLowerCase();
                String[] queryWords = searchText.split("\\s+");
                
                ordered.sort((p1, p2) -> {
                    String name1 = (p1.getName() != null ? p1.getName() : "").toLowerCase();
                    String name2 = (p2.getName() != null ? p2.getName() : "").toLowerCase();
                    
                    int score1 = calculateRelevanceScore(name1, searchText, queryWords);
                    int score2 = calculateRelevanceScore(name2, searchText, queryWords);
                    
                    int compare = Integer.compare(score2, score1);
                    if (compare == 0) {
                        // Nếu relevance bằng nhau, sắp xếp theo rating
                        Double rating1 = p1.getRating() != null ? p1.getRating() : 0.0;
                        Double rating2 = p2.getRating() != null ? p2.getRating() : 0.0;
                        return Double.compare(rating2, rating1);
                    }
                    return compare;
                });
            }

            List<ProductResponse> productResponses = ordered.stream()
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
            logger.error("Search failed: {}", e.getMessage(), e);
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