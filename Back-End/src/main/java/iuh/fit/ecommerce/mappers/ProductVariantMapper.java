package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.product.ProductVariantResponse;
import iuh.fit.ecommerce.entities.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { ProductVariantValueMapper.class })
public interface ProductVariantMapper {
    ProductVariantResponse toResponse(ProductVariant productVariant);
}
