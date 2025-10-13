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
}