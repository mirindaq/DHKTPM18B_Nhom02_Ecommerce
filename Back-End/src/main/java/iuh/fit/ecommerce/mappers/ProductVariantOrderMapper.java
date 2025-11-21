package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.product.ProductVariantOrderResponse;
import iuh.fit.ecommerce.entities.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductVariantOrderMapper {

    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productThumbnail", source = "product.thumbnail")
    @Mapping(target = "brandName", source = "product.brand.name")
    @Mapping(target = "categoryName", source = "product.category.name")
    ProductVariantOrderResponse toOrderResponse(ProductVariant productVariant);
}

