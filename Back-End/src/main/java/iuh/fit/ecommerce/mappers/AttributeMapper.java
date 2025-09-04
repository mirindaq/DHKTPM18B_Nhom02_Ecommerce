package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.category.CategoryResponse.AttributeResponse;
import iuh.fit.ecommerce.entities.Attribute;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AttributeMapper {
    AttributeResponse toResponse(Attribute attribute);

    @Named("mapActiveAttributes")
    default List<AttributeResponse> mapActiveAttributes(List<Attribute> attributes) {
        if (attributes == null) return null;
        return attributes.stream()
                .filter(Attribute::isStatus) // chỉ lấy status = true
                .map(this::toResponse)
                .toList();
    }
}