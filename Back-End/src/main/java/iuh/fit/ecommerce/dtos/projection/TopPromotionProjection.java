package iuh.fit.ecommerce.dtos.projection;

public interface TopPromotionProjection {
    Long getPromotionId();
    String getPromotionName();
    String getPromotionType();
    Long getUsageCount();
    Double getTotalDiscountAmount();
}
