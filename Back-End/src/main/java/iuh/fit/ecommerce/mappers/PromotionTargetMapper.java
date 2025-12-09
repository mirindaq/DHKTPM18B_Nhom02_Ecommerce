package iuh.fit.ecommerce.mappers;


import iuh.fit.ecommerce.dtos.response.promotion.PromotionTargetResponse;
import iuh.fit.ecommerce.entities.*;
import org.mapstruct.*;


@Mapper(componentModel = "spring")
public interface PromotionTargetMapper {

    @Mapping(source = "productVariant.id", target = "productVariantId")
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "brand.id", target = "brandId")
    PromotionTargetResponse toResponse(PromotionTarget request);
    
    // Custom mapping để tự động lấy productId từ productVariant nếu product null
    @AfterMapping
    default void setProductIdFromVariant(
            PromotionTarget request, 
            @MappingTarget PromotionTargetResponse response) {
        // Nếu có productVariantId nhưng không có productId, lấy từ productVariant
        if (response.getProductVariantId() != null && response.getProductId() == null) {
            if (request.getProductVariant() != null && request.getProductVariant().getProduct() != null) {
                response.setProductId(request.getProductVariant().getProduct().getId());
            }
        }
    }
}