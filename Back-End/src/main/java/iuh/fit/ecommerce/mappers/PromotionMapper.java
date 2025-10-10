package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.request.promotion.PromotionAddRequest;
import iuh.fit.ecommerce.dtos.request.promotion.PromotionTargetRequest;
import iuh.fit.ecommerce.dtos.request.promotion.PromotionUpdateRequest;
import iuh.fit.ecommerce.dtos.response.promotion.PromotionResponse;
import iuh.fit.ecommerce.entities.Category;
import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.entities.Promotion;
import iuh.fit.ecommerce.entities.PromotionTarget;
import org.mapstruct.*;

import java.util.ArrayList;
import java.util.List;

@Mapper(componentModel = "spring")
public interface PromotionMapper {

    @Mapping(target = "id", ignore = true)
    Promotion toPromotion(PromotionAddRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updatePromotionFromDto(PromotionUpdateRequest request, @MappingTarget Promotion promotion);

    PromotionResponse toResponse(Promotion promotion);

    // PromotionTargetRequest -> PromotionTarget
    default List<PromotionTarget> toPromotionTargets(List<PromotionTargetRequest> targets, Promotion promotion) {
        List<PromotionTarget> list = new ArrayList<>();
        if (targets != null) {
            for (PromotionTargetRequest t : targets) {
                PromotionTarget pt = new PromotionTarget();
                pt.setPromotion(promotion);
                if (t.getProductId() != null) {
                    pt.setProduct(Product.builder().id(t.getProductId()).build());
                }
                if (t.getProductVariantId() != null) {
                    pt.setProductVariant(ProductVariant.builder().id(t.getProductVariantId()).build());
                }
                if (t.getCategoryId() != null) {
                    pt.setCategory(Category.builder().id(t.getCategoryId()).build()); // category entity cần có
                }
                list.add(pt);
            }
        }
        return list;
    }
}
