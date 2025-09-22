package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.product.ProductVariantValueResponse;
import iuh.fit.ecommerce.entities.ProductVariantValue;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = VariantValueMapper.class)
public interface ProductVariantValueMapper {
    ProductVariantValueResponse toResponse(ProductVariantValue entity);
}

