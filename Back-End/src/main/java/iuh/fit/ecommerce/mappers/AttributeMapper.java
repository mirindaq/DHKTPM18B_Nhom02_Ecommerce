package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.category.CategoryResponse.AttributeResponse;
import iuh.fit.ecommerce.entities.Attribute;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AttributeMapper {
    AttributeResponse toResponse(Attribute attribute);
}