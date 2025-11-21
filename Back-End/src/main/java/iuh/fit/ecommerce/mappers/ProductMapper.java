package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.request.product.ProductAddRequest;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.entities.Product;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.Comparator;
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
    default void sortVariantsByPrice(@MappingTarget ProductResponse response) {
        if (response != null && response.getVariants() != null && !response.getVariants().isEmpty()) {
            // Sort variants by price (lowest first)
            var sortedVariants = response.getVariants().stream()
                    .sorted(Comparator.comparing(v -> {
                        // Calculate final price considering discount
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
