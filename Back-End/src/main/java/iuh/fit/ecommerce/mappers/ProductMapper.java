package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.request.product.ProductAddRequest;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.entities.Promotion;
import iuh.fit.ecommerce.services.PromotionService;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Mapper(
        componentModel = "spring",
        uses = {
                ProductAttributeValueMapper.class,
                ProductVariantMapper.class,
                VariantValueMapper.class,
                AttributeMapper.class,
                ProductImageMapper.class,
                ProductVariantValueMapper.class
        }
)
public interface ProductMapper {

    @Mapping(target = "attributes", ignore = true)
    @Mapping(target = "productImages", ignore = true)
    void requestToEntity(ProductAddRequest productAddRequest, @MappingTarget Product product);

    @Mapping(source = "productVariants", target = "variants")
    @Mapping(source = "brand.id", target = "brandId")
    @Mapping(source = "category.id", target = "categoryId")
    ProductResponse toResponse(Product product);

    @AfterMapping
    default void sortVariantsByPrice(@MappingTarget ProductResponse response, Product product, PromotionService promotionService) {
        if (response != null && response.getVariants() != null && !response.getVariants().isEmpty()) {

            // Get product variants and their associated promotions
            List<ProductVariant> variants = product.getProductVariants();
            Map<Long, List<Promotion>> promosByVariant = promotionService.getPromotionsGroupByVariantId(variants, product);

            // Map variants by ID
            var variantMap = variants.stream()
                    .collect(Collectors.toMap(ProductVariant::getId, v -> v));

            for (var v : response.getVariants()) {
                ProductVariant entityVariant = variantMap.get(v.getId());
                if (entityVariant == null) continue;

                // Calculate original price
                Double originalPrice = promotionService.calculateOriginalPrice(entityVariant);
                v.setOldPrice(originalPrice);

                // Get best promotion for the variant
                Promotion bestPromo = promotionService.getBestPromotion(entityVariant, promosByVariant);

                if (bestPromo != null) {
                    // Calculate the final price after applying the discount
                    Double finalPrice = promotionService.calculateDiscountPrice(entityVariant, bestPromo);
                    v.setPrice(finalPrice);
                    v.setDiscount(bestPromo.getDiscount());
                } else {
                    v.setPrice(originalPrice);
                    v.setDiscount(0.0);
                }
            }

            // Sort the variants by price (lowest first)
            var sortedVariants = response.getVariants().stream()
                    .sorted(Comparator.comparing(v -> {
                        double finalPrice = v.getOldPrice() != null && v.getOldPrice() > 0
                                ? v.getOldPrice() * (1 - (v.getDiscount() != null ? v.getDiscount() : 0.0) / 100.0)
                                : v.getPrice();
                        return finalPrice;
                    }))
                    .collect(Collectors.toList());
            response.setVariants(sortedVariants);
        }
    }
}
