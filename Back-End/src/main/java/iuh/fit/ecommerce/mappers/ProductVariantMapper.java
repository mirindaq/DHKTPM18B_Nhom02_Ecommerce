package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.product.ProductVariantResponse;
import iuh.fit.ecommerce.entities.ProductVariant;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = VariantValueMapper.class)
public interface ProductVariantMapper {
    ProductVariantResponse toResponse(ProductVariant productVariant);
}