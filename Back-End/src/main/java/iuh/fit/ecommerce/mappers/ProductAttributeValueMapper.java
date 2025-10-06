package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.product.ProductAttributeResponse;
import iuh.fit.ecommerce.entities.ProductAttributeValue;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = AttributeMapper.class)
public interface ProductAttributeValueMapper {
    ProductAttributeResponse toResponse(ProductAttributeValue productAttributeValue);
}
