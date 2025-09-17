package iuh.fit.ecommerce.mappers;

import org.mapstruct.Mapper;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;
import iuh.fit.ecommerce.entities.Category;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring", uses = {AttributeMapper.class})
public interface CategoryMapper {
//    @Mapping(target = "attributes", source = "attributes", qualifiedByName = "mapActiveAttributes")
    CategoryResponse toResponse(Category category);

    @Named("toResponseWithoutAttributes")
    @Mapping(target = "attributes", ignore = true)
    CategoryResponse toResponseWithoutAttributes(Category category);
}