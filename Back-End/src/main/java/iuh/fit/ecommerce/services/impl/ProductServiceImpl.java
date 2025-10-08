package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.product.ProductAddRequest;
import iuh.fit.ecommerce.dtos.request.product.ProductAttributeRequest;
import iuh.fit.ecommerce.dtos.request.product.ProductVariantRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.entities.*;
import iuh.fit.ecommerce.exceptions.custom.ConflictException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.ProductMapper;
import iuh.fit.ecommerce.repositories.*;
import iuh.fit.ecommerce.services.*;
import iuh.fit.ecommerce.utils.StringUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final BrandService brandService;
    private final CategoryService categoryService;
    private final AttributeService attributeService;
    private final VariantValueService variantValueService;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final ProductVariantRepository productVariantRepository;
    private final ProductVariantValueRepository productVariantValueRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;

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
        return productMapper.toResponse(productRepository.getProductBySlug(slug));
    }

    @Override
    public ProductResponse updateProductById(Long id) {
        return null;
    }

    private Product getProductEntityById(Long id){
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
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

}
