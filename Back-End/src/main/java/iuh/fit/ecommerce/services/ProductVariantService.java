package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.product.ProductVariantDescriptionResponse;

import java.util.List;

public interface ProductVariantService {

    List<ProductVariantDescriptionResponse> getAllSkusForPromotion(Long productId);
}