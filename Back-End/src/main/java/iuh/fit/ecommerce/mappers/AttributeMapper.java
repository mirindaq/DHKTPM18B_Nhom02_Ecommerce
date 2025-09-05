package iuh.fit.ecommerce.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import iuh.fit.ecommerce.dtos.response.attribute.AttributeResponse;
import iuh.fit.ecommerce.entities.Attribute;

@Mapper(componentModel = "spring")
public interface AttributeMapper {
    @Mapping(source = "category.name", target = "categoryName")
    AttributeResponse toResponse(Attribute attribute);

//    @Named("mapActiveAttributes")
//    default List<AttributeResponse> mapActiveAttributes(List<Attribute> attributes) {
//        if (attributes == null) return null;
//        return attributes.stream()
//                .filter(Attribute::isStatus) // chỉ lấy status = true
//                .map(this::toResponse)
//                .toList();
//    }
}