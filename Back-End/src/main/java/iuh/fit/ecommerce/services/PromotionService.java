package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.promotion.PromotionAddRequest;
import iuh.fit.ecommerce.dtos.request.promotion.PromotionUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.promotion.PromotionResponse;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.entities.Promotion;

import java.time.LocalDate;
import java.util.List;

public interface PromotionService {
    PromotionResponse createPromotion(PromotionAddRequest request);
    PromotionResponse getPromotionById(Long id);
    ResponseWithPagination<List<PromotionResponse>> getAllPromotions(
            int page, int limit,
            String name, String type,
            Boolean active,
            LocalDate startDate, LocalDate endDate
    );
    PromotionResponse updatePromotion(Long id, PromotionUpdateRequest request);
    void deletePromotion(Long id);
    void changeStatusPromotion(Long id);
    Double calculateDiscountPrice(ProductVariant variant);
    Double calculateOriginalPrice(ProductVariant variant);
    Promotion getBestPromotion(ProductVariant variant);
}
