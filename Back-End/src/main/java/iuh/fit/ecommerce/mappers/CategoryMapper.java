package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;
import iuh.fit.ecommerce.entities.Category;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring", uses = {AttributeMapper.class})
public interface CategoryMapper {
//    @Mapping(source = "modifiedAt", target = "updatedAt")
    CategoryResponse toResponse(Category category);
}