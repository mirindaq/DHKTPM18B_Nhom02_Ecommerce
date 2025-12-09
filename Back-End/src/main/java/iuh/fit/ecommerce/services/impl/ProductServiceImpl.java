package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.product.ProductAddRequest;
import iuh.fit.ecommerce.dtos.request.product.ProductAttributeRequest;
import iuh.fit.ecommerce.dtos.request.product.ProductUpdateRequest;
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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final BrandService brandService;
    private final CategoryService categoryService;
    private final AttributeService attributeService;
    private final VariantValueService variantValueService;
    private final PromotionService promotionService;
    private final UploadService uploadService;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final ProductVariantRepository productVariantRepository;
    private final ProductVariantValueRepository productVariantValueRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final ProductFilterValueRepository productFilterValueRepository;
    private final FilterValueRepository filterValueRepository;
    private final ProductImageRepository productImageRepository;
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
    public ResponseWithPagination<List<ProductResponse>> getAllProducts(int page, int size, String keyword, Long brandId, Long categoryId, Boolean status, Double minPrice, Double maxPrice) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.findProductsWithFilters(keyword, brandId, categoryId, status, minPrice, maxPrice, pageable);
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
        return promotionService.addPromotionToProductResponseByProduct( product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = getProductEntityById(id);
        
        // Check if name changed and new name already exists
        if (!product.getName().equals(request.getName()) && 
            productRepository.existsByName(request.getName())) {
            throw new ConflictException("Product name already exists with name: " + request.getName());
        }
        
        // Xóa thumbnail cũ trên MinIO nếu có thay đổi
        String oldThumbnail = product.getThumbnail();
        String newThumbnail = request.getThumbnail();
        if (oldThumbnail != null && !oldThumbnail.isEmpty() 
            && !oldThumbnail.equals(newThumbnail)) {
            try {
                uploadService.deleteFile(oldThumbnail);
            } catch (Exception e) {
                // Log lỗi nhưng không throw để không block việc update
            }
        }
        
        // Update basic info
        product.setName(request.getName());
        product.setSpu(request.getSpu());
        product.setDescription(request.getDescription());
        product.setThumbnail(request.getThumbnail());
        product.setStatus(request.isStatus());
        product.setSlug(StringUtils.normalizeString(request.getName()));
        
        // Update brand and category
        Brand brand = brandService.getBrandEntityById(request.getBrandId());
        Category category = categoryService.getCategoryEntityById(request.getCategoryId());
        product.setBrand(brand);
        product.setCategory(category);
        
        // Update product images
        updateProductImages(product, request.getProductImages());
        
        // Update attributes
        updateAttributes(product, request.getAttributes());
        
        // Update variants
        updateVariants(product, request.getVariants());
        
        // Update filter values
        updateFilterValues(product, request.getFilterValueIds());
        
        productRepository.save(product);
        
        // Re-index to Elasticsearch
        Product savedProduct = productRepository.findById(product.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found after update"));
        productSearchService.indexProduct(savedProduct);
        
        return productMapper.toResponse(savedProduct);
    }
    
    @Override
    @Transactional
    public void changeStatusProduct(Long id) {
        Product product = getProductEntityById(id);
        product.setStatus(!product.getStatus());
        productRepository.save(product);
        
        // Re-index to Elasticsearch
        productSearchService.indexProduct(product);
    }
    
    private void updateProductImages(Product product, List<String> newImageUrls) {
        List<String> oldImageUrls = product.getProductImages().stream()
                .map(ProductImage::getUrl)
                .toList();
        
        List<String> imagesToDelete = oldImageUrls.stream()
                .filter(oldUrl -> !newImageUrls.contains(oldUrl))
                .toList();
        
        for (String urlToDelete : imagesToDelete) {
            try {
                uploadService.deleteFile(urlToDelete);
            } catch (Exception e) {
                // Log but don't throw
            }
        }
        
        // Xóa từng image cũ thay vì clear() để tránh orphan removal issue
        product.getProductImages().removeIf(img -> !newImageUrls.contains(img.getUrl()));
        
        // Thêm các image mới (chưa có trong list hiện tại)
        Set<String> existingUrls = product.getProductImages().stream()
                .map(ProductImage::getUrl)
                .collect(Collectors.toSet());
        
        for (String url : newImageUrls) {
            if (!existingUrls.contains(url)) {
                ProductImage newImage = ProductImage.builder()
                        .url(url)
                        .product(product)
                        .build();
                product.getProductImages().add(newImage);
            }
        }
    }
    
    private void updateAttributes(Product product, List<ProductAttributeRequest> newAttributes) {
        if (newAttributes == null || newAttributes.isEmpty()) {
            return;
        }
        
        // Delete existing attributes
        productAttributeValueRepository.deleteByProductId(product.getId());
        
        // Create new attributes
        for (ProductAttributeRequest req : newAttributes) {
            ProductAttributeValue attributeValue = ProductAttributeValue.builder()
                    .value(req.getValue())
                    .product(product)
                    .status(true)
                    .attribute(attributeService.getAttributeEntityById(req.getAttributeId()))
                    .build();
            productAttributeValueRepository.save(attributeValue);
        }
    }
    
    private void updateVariants(Product product, List<ProductVariantRequest> newVariants) {
        if (newVariants == null || newVariants.isEmpty()) {
            return;
        }
        
        // Get existing variant SKUs to preserve IDs
        Map<String, ProductVariant> existingVariantsBySku = product.getProductVariants().stream()
                .collect(Collectors.toMap(ProductVariant::getSku, v -> v, (v1, v2) -> v1));
        
        // Track which variants should remain
        Set<Long> variantIdsToKeep = new HashSet<>();
        
        for (ProductVariantRequest req : newVariants) {
            String newSku = generateSku(product.getSpu(), req.getVariantValueIds());
            
            if (existingVariantsBySku.containsKey(newSku)) {
                // Update existing variant
                ProductVariant existingVariant = existingVariantsBySku.get(newSku);
                existingVariant.setPrice(req.getPrice());
                existingVariant.setStock(req.getStock());
                productVariantRepository.save(existingVariant);
                variantIdsToKeep.add(existingVariant.getId());
                
                // Re-index variant
                vectorStoreService.indexProductVariant(existingVariant);
            } else {
                // Create new variant
                ProductVariant variant = ProductVariant.builder()
                        .price(req.getPrice())
                        .sku(newSku)
                        .stock(req.getStock())
                        .product(product)
                        .build();
                productVariantRepository.save(variant);
                saveVariantValues(req.getVariantValueIds(), variant);
                variantIdsToKeep.add(variant.getId());
                
                // Index new variant
                ProductVariant savedVariant = productVariantRepository.findById(variant.getId())
                        .orElse(variant);
                vectorStoreService.indexProductVariant(savedVariant);
            }
        }
        
        // Delete variants that are no longer needed
        List<ProductVariant> variantsToDelete = product.getProductVariants().stream()
                .filter(v -> !variantIdsToKeep.contains(v.getId()))
                .toList();
        
        for (ProductVariant variantToDelete : variantsToDelete) {
            // Delete variant values first
            productVariantValueRepository.deleteByProductVariantId(variantToDelete.getId());
            // Remove from product's collection
            product.getProductVariants().remove(variantToDelete);
            // Delete from database
            productVariantRepository.delete(variantToDelete);
        }
    }
    
    private void updateFilterValues(Product product, List<Long> newFilterValueIds) {
        // Delete existing filter values
        productFilterValueRepository.deleteByProductId(product.getId());
        
        // Save new filter values
        if (newFilterValueIds != null && !newFilterValueIds.isEmpty()) {
            List<FilterValue> filterValues = filterValueRepository.findAllById(newFilterValueIds);
            for (FilterValue filterValue : filterValues) {
                ProductFilterValue productFilterValue = ProductFilterValue.builder()
                        .product(product)
                        .filterValue(filterValue)
                        .build();
                productFilterValueRepository.save(productFilterValue);
            }
        }
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
            case "rating_asc":
                // Sort by rating ascending - will be handled in specification
                return PageRequest.of(page, size);
            case "rating_desc":
                // Sort by rating descending - will be handled in specification
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
        // Get variant values and use their existing slug field, fallback to value if slug is null
        List<String> slugs = variantValueIds.stream()
                .map(id -> variantValueService.getVariantValueEntityById(id))
                .map(vv -> {
                    String slug = vv.getSlug();
                    return (slug != null && !slug.isEmpty()) ? slug : vv.getValue();
                })
                .filter(s -> s != null && !s.isEmpty())
                .sorted()
                .collect(Collectors.toList());
        
        String slugsPart = String.join("-", slugs);
        return spu + "-" + slugsPart;
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
