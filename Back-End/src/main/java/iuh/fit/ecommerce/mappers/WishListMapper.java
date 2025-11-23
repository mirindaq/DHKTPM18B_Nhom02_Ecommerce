package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.wishList.WishListResponse;
import iuh.fit.ecommerce.entities.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WishListMapper {

    @Mapping(source = "id", target = "productVariantId")
    @Mapping(source = "product.name", target = "productName")

    @Mapping(source = "product.thumbnail", target = "productImage")
    WishListResponse toResponse(ProductVariant productVariant);

    List<WishListResponse> toResponseList(List<ProductVariant> productVariants);

}