package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;
import iuh.fit.ecommerce.entities.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring", uses = {AttributeMapper.class})
public interface CategoryMapper {

    @Mapping(target = "attributes", source = "attributes", qualifiedByName = "mapActiveAttributes")
    CategoryResponse toResponse(Category category);
}