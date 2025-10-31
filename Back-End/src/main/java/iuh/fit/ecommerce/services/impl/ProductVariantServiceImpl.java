package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.response.product.ProductVariantDescriptionResponse;
import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.mappers.ProductVariantMapper;
import iuh.fit.ecommerce.services.ProductService;
import iuh.fit.ecommerce.services.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductService productService;
    private final ProductVariantMapper productVariantMapper;

    @Override
    public List<ProductVariantDescriptionResponse> getAllSkusForPromotion(Long productId) {
        Product product = productService.getProductEntityById(productId);
        List<ProductVariant> productVariants = product.getProductVariants();

        return productVariantMapper.toProductVariantDescriptionResponse(productVariants);
    }
}