package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.product.ProductVariantPromotionRequest;
import iuh.fit.ecommerce.dtos.response.product.ProductVariantDescriptionResponse;
import iuh.fit.ecommerce.dtos.response.product.ProductVariantPromotionResponse;

import java.util.List;

public interface ProductVariantService {

    List<ProductVariantDescriptionResponse> getAllSkusForPromotion(Long productId);
    List<ProductVariantPromotionResponse> getProductsVariantPromotions(ProductVariantPromotionRequest productVariantPromotionRequest);
}