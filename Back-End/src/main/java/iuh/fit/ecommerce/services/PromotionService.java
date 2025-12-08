package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.promotion.PromotionAddRequest;
import iuh.fit.ecommerce.dtos.request.promotion.PromotionUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.dtos.response.promotion.PromotionResponse;
import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.entities.Promotion;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface PromotionService {
    PromotionResponse createPromotion(PromotionAddRequest request);
    PromotionResponse getPromotionById(Long id);
    ResponseWithPagination<List<PromotionResponse>> getAllPromotions(
            int page, int limit,
            String name, String type,
            Boolean active,
            LocalDate startDate,
            Integer priority
    );
    PromotionResponse updatePromotion(Long id, PromotionUpdateRequest request);
    void deletePromotion(Long id);
    void changeStatusPromotion(Long id);
    Double calculateDiscountPrice(ProductVariant variant, Promotion promotion);
    Double calculateOriginalPrice(ProductVariant variant);
    Promotion getBestPromotion(ProductVariant variant, Map<Long, List<Promotion>> promosByVariant);

    Map<Long, List<Promotion>>  getPromotionsGroupByVariantId(List<ProductVariant> variants, Product product);

    Promotion getBestPromotionForVariant(ProductVariant variant);

    ProductResponse addPromotionToProductResponseByProduct(Product product);
}
