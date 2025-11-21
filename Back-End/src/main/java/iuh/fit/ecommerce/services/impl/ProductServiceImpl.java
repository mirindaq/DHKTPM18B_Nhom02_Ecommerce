package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.product.ProductAddRequest;
import iuh.fit.ecommerce.dtos.request.product.ProductAttributeRequest;
import iuh.fit.ecommerce.dtos.request.product.ProductVariantPromotionRequest;
import iuh.fit.ecommerce.dtos.request.product.ProductVariantRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.dtos.response.product.ProductVariantPromotionResponse;
import iuh.fit.ecommerce.dtos.response.product.ProductVariantResponse;
import iuh.fit.ecommerce.entities.*;
import iuh.fit.ecommerce.exceptions.custom.ConflictException;
import iuh.fit.ecommerce.exceptions.custom.InvalidParamException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.ProductMapper;
import iuh.fit.ecommerce.repositories.*;
import iuh.fit.ecommerce.services.*;
import iuh.fit.ecommerce.services.ProductSearchService;
import iuh.fit.ecommerce.services.VectorStoreService;
import iuh.fit.ecommerce.utils.StringUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final BrandService brandService;
    private final CategoryService categoryService;
    private final AttributeService attributeService;
    private final VariantValueService variantValueService;
    private final PromotionService promotionService;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final ProductVariantRepository productVariantRepository;
    private final ProductVariantValueRepository productVariantValueRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final ProductFilterValueRepository productFilterValueRepository;
    private final FilterValueRepository filterValueRepository;
    private final VectorStoreService vectorStoreService;
    private final ProductSearchService productSearchService;

    @Override
    @Transactional
    public void createProduct(ProductAddRequest productAddRequest) {
        if(productRepository.existsByName(productAddRequest.getName())){
            throw new ConflictException("Product name already exists with name: " + productAddRequest.getName());
        }
        Brand brand = brandService.getBrandEntityById(productAddRequest.getBrandId());
        Category category = categoryService.getCategoryEntityById(productAddRequest.getCategoryId());

        Product product = buildProduct(productAddRequest, brand, category);
        productRepository.save(product);


        saveAttributes(productAddRequest.getAttributes(), product);

        saveVariants(productAddRequest.getVariants(), product);

        saveFilterValues(productAddRequest.getFilterValueIds(), product);
        
        // Reload product with all relationships before indexing
        Product savedProduct = productRepository.findById(product.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found after creation"));
        
        // Index product to Elasticsearch
        productSearchService.indexProduct(savedProduct);

    }

    private void saveAttributes(List<ProductAttributeRequest> attributes, Product product) {
        for (ProductAttributeRequest req : attributes) {
            ProductAttributeValue productAttributeValue = ProductAttributeValue.builder()
                    .value(req.getValue())
                    .product(product)
                    .status(true)
                    .attribute(attributeService.getAttributeEntityById(req.getAttributeId()))
                    .build();
            productAttributeValueRepository.save(productAttributeValue);
        }
    }

    @Override
    public ResponseWithPagination<List<ProductResponse>> getAllProducts(int page, int size) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.findAll(pageable);
        return ResponseWithPagination.fromPage(productPage, productMapper::toResponse);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        return productMapper.toResponse(getProductEntityById(id));
    }

    @Override
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.getProductBySlug(slug);
        if (product == null) {
            return null;
        }

        ProductResponse response = productMapper.toResponse(product);
        List<ProductVariant> variants = product.getProductVariants();
        if (variants == null || variants.isEmpty()) return response;

        Map<Long, List<Promotion>>  promosByVariant = promotionService.getPromotionsGroupByVariantId(variants, product);

        Map<Long, ProductVariant> variantMap = variants.stream()
                .collect(Collectors.toMap(ProductVariant::getId, v -> v));

        for (ProductVariantResponse v : response.getVariants()) {
            ProductVariant entityVariant = variantMap.get(v.getId());
            if (entityVariant == null) continue;

            Double originalPrice = promotionService.calculateOriginalPrice(entityVariant);
            v.setOldPrice(originalPrice);

            Promotion bestPromo = promotionService.getBestPromotion(entityVariant, promosByVariant);

            if (bestPromo != null) {
                Double finalPrice = promotionService.calculateDiscountPrice(entityVariant, bestPromo);
                v.setPrice(finalPrice);
                v.setDiscount(bestPromo.getDiscount());
            } else {
                v.setPrice(originalPrice);
                v.setDiscount(0.0);
            }
        }

        return response;
    }

    @Override
    public ProductResponse updateProductById(Long id) {
        return null;
    }

    @Override
    public Product getProductEntityById(Long id){
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Override
    public Product getProductEntityBySlug(String slug) {
        return productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
    }

    @Override
    public ResponseWithPagination<List<ProductResponse>> searchProductForUser(String categorySlug, int page, int size, Map<String, String> filters) {
        page = Math.max(page - 1, 0);
        
        List<String> brandSlugs = parseCommaSeparatedParam(filters.get("brands"));
        Boolean inStock = parseBooleanParam(filters.get("inStock"));
        Double priceMin = parseDoubleParam(filters.get("priceMin"));
        Double priceMax = parseDoubleParam(filters.get("priceMax"));
        String sortBy = filters.get("sortBy");
        
        // Parse filter value IDs from params
        List<Long> filterValueIds = null;
        String filterValuesParam = filters.get("filterValues");
        if (filterValuesParam != null && !filterValuesParam.trim().isEmpty()) {
            try {
                filterValueIds = java.util.Arrays.stream(filterValuesParam.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .collect(java.util.stream.Collectors.toList());
            } catch (NumberFormatException e) {
                // Invalid format, ignore
            }
        }
        
        // Create Pageable with sorting
        Pageable pageable = createPageableWithSort(page, size, sortBy);
        
        Page<Product> productPage = productRepository.findAll(
            iuh.fit.ecommerce.specifications.ProductSpecification.filterProducts(
                categorySlug, brandSlugs, inStock, priceMin, priceMax, filterValueIds, sortBy
            ),
            pageable
        );
        
        return ResponseWithPagination.fromPage(productPage, productMapper::toResponse);
    }
    
    private Pageable createPageableWithSort(int page, int size, String sortBy) {
        if (sortBy == null || sortBy.isEmpty() || "popular".equals(sortBy)) {
            // Default: sort by id (newest first)
            return PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());
        }
        
        switch (sortBy) {
            case "price_asc":
                // Sort by min price ascending - will be handled in specification
                return PageRequest.of(page, size);
            case "price_desc":
                // Sort by min price descending - will be handled in specification
                return PageRequest.of(page, size);
            case "promotion_hot":
                // Sort by discount descending - will be handled in specification
                return PageRequest.of(page, size);
            default:
                return PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());
        }
    }
    
    private List<String> parseCommaSeparatedParam(String param) {
        if (param == null || param.trim().isEmpty()) {
            return null;
        }
        return java.util.Arrays.asList(param.split(","));
    }
    
    private Boolean parseBooleanParam(String param) {
        if (param == null || param.trim().isEmpty()) {
            return null;
        }
        return Boolean.parseBoolean(param);
    }
    
    private Double parseDoubleParam(String param) {
        if (param == null || param.trim().isEmpty()) {
            return null;
        }
        try {
            return Double.parseDouble(param);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Product buildProduct(ProductAddRequest request, Brand brand, Category category) {
        Product product = new Product();
        productMapper.requestToEntity(request, product);

        product.setBrand(brand);
        product.setCategory(category);
        product.setSlug(StringUtils.normalizeString(request.getName()));

        product.setProductImages(buildImages(request.getProductImages(), product));
        product.setAttributes(buildAttributes(request.getAttributes()));

        return product;
    }

    private List<ProductImage> buildImages(List<String> urls, Product product) {
        return urls.stream()
                .map(url -> ProductImage.builder()
                        .url(url)
                        .product(product)
                        .build())
                .toList();
    }

    private List<ProductAttributeValue> buildAttributes(List<ProductAttributeRequest> attrs) {
        return attrs.stream()
                .map(attr -> ProductAttributeValue.builder()
                        .value(attr.getValue())
                        .status(true)
                        .attribute(attributeService.getAttributeEntityById(attr.getAttributeId()))
                        .build())
                .toList();
    }

    private void saveVariants(List<ProductVariantRequest> requests, Product product) {
        for (ProductVariantRequest req : requests) {
            ProductVariant variant = ProductVariant.builder()
                    .price(req.getPrice())
                    .oldPrice(req.getOldPrice())
                    .sku(generateSku(product.getSpu(), req.getVariantValueIds()))
                    .stock(req.getStock())
                    .product(product)
                    .build();

            productVariantRepository.save(variant);
            saveVariantValues(req.getVariantValueIds(), variant);
            
            // Reload variant để có đầy đủ thông tin (product, variant values)
            ProductVariant savedVariant = productVariantRepository.findById(variant.getId())
                    .orElse(variant);
            
            // Index vào Qdrant vector store
            vectorStoreService.indexProductVariant(savedVariant);
        }
    }

    private void saveVariantValues(List<Long> variantValueIds, ProductVariant variant) {
        for (Long id : variantValueIds) {
            VariantValue variantValue = variantValueService.getVariantValueEntityById(id);
            ProductVariantValue pvValue = ProductVariantValue.builder()
                    .productVariant(variant)
                    .variantValue(variantValue)
                    .build();

            productVariantValueRepository.save(pvValue);
        }
    }

    private String generateSku(String spu, List<Long> variantValueIds) {
        String idsPart = variantValueIds.stream()
                .sorted()
                .map(String::valueOf)
                .collect(Collectors.joining("-"));
        return spu + "-" + idsPart;
    }

    private void saveFilterValues(List<Long> filterValueIds, Product product) {
        if (filterValueIds == null || filterValueIds.isEmpty()) {
            return;
        }

        List<FilterValue> filterValues = filterValueRepository.findAllById(filterValueIds);
        
        for (FilterValue filterValue : filterValues) {
            ProductFilterValue productFilterValue = ProductFilterValue.builder()
                    .product(product)
                    .filterValue(filterValue)
                    .build();
            productFilterValueRepository.save(productFilterValue);
        }
    }

}
