package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.variantCategory.VariantCategoryResponse;
import iuh.fit.ecommerce.entities.VariantCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VariantCategoryMapper {

    /**
     * Chuyển đổi từ Entity VariantCategory sang VariantCategoryResponse DTO.
     */
    @Mapping(source = "variant.id", target = "variantId")
    @Mapping(source = "variant.name", target = "variantName")
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    VariantCategoryResponse toResponse(VariantCategory entity);
}

