package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.wishList.WishListResponse;
import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WishListMapper {

    @Mapping(source = "id", target = "productId")
    @Mapping(source = "name", target = "productName")
    @Mapping(source = "slug", target = "productSlug")
    @Mapping(source = "thumbnail", target = "productImage")
    @Mapping(source = "productVariants", target = "price", qualifiedByName = "getLowestPrice")
    WishListResponse toResponse(Product product);

    List<WishListResponse> toResponseList(List<Product> products);

    @Named("getLowestPrice")
    default Double getLowestPrice(List<ProductVariant> variants) {
        if (variants == null || variants.isEmpty()) {
            return 0.0;
        }
        
        return variants.stream()
                .filter(variant -> variant != null && variant.getPrice() != null)
                .map(ProductVariant::getPrice)
                .filter(price -> price > 0)
                .min(Double::compareTo)
                .orElse(0.0);
    }

}