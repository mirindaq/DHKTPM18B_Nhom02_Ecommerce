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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductSearchServiceImpl implements ProductSearchService {
    
    private static final Logger logger = LoggerFactory.getLogger(ProductSearchServiceImpl.class);
    
    private final ProductSearchRepository productSearchRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final ElasticsearchOperations elasticsearchOperations;

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
                // 1. Xử lý chuỗi tìm kiếm: Xóa ngoặc kép để tránh lỗi cú pháp nếu user nhập
                String searchText = query.trim().replace("\"", "");

                // 2. SỬA TẠI ĐÂY: Dùng .matches() thay vì .contains()
                // .matches() sử dụng thuật toán Full-text search (phân tích từ ngữ)
                // Nó hiểu được dấu cách và tìm kiếm chính xác hơn
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
            List<Product> orderedProducts = new ArrayList<>();
            for (Long id : productIds) {
                products.stream()
                        .filter(p -> p.getId().equals(id))
                        .findFirst()
                        .ifPresent(orderedProducts::add);
            }

            List<ProductResponse> productResponses = orderedProducts.stream()
                    .map(productMapper::toResponse)
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