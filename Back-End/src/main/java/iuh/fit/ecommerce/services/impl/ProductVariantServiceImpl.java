package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.product.ProductVariantPromotionRequest;
import iuh.fit.ecommerce.dtos.response.product.ProductVariantDescriptionResponse;
import iuh.fit.ecommerce.dtos.response.product.ProductVariantPromotionResponse;
import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.entities.Promotion;
import iuh.fit.ecommerce.exceptions.custom.InvalidParamException;
import iuh.fit.ecommerce.mappers.ProductVariantMapper;
import iuh.fit.ecommerce.repositories.ProductVariantRepository;
import iuh.fit.ecommerce.services.ProductService;
import iuh.fit.ecommerce.services.ProductVariantService;
import iuh.fit.ecommerce.services.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductService productService;
    private final ProductVariantMapper productVariantMapper;
    private final ProductVariantRepository productVariantRepository;
    private final PromotionService promotionService;

    @Override
    public List<ProductVariantDescriptionResponse> getAllSkusForPromotion(Long productId) {
        Product product = productService.getProductEntityById(productId);
        List<ProductVariant> productVariants = product.getProductVariants();

        return productVariantMapper.toProductVariantDescriptionResponse(productVariants);
    }

    @Override
    public List<ProductVariantPromotionResponse> getProductsVariantPromotions(ProductVariantPromotionRequest productVariantPromotionRequest) {
        if(productVariantPromotionRequest.getProductVariantIds().isEmpty())
            throw new InvalidParamException("Product variant ids list is empty");

        Map<Long, ProductVariant> productVariants = productVariantRepository.findAllById(
                productVariantPromotionRequest.getProductVariantIds()
        ).stream().collect(Collectors.toMap(ProductVariant::getId, pv -> pv));

        List<ProductVariantPromotionResponse> responses = new ArrayList<>();

        for(Long pvId : productVariantPromotionRequest.getProductVariantIds()){
            ProductVariant variant = productVariants.get(pvId);
            if(variant == null) continue;

            Promotion bestPromotion = promotionService.getBestPromotionForVariant(variant);
            Double discount = bestPromotion != null ? bestPromotion.getDiscount() : 0.0;

            ProductVariantPromotionResponse response = ProductVariantPromotionResponse.builder()
                    .productVariantId(pvId)
                    .discount(discount)
                    .build();
            responses.add(response);
        }
        return responses;
    }
}