package iuh.fit.ecommerce.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import iuh.fit.ecommerce.dtos.response.variant.VariantResponse;
import iuh.fit.ecommerce.entities.Variant;

@Mapper(componentModel = "spring", uses = {VariantValueMapper.class, CategoryMapper.class})
public interface VariantMapper {

    @Mapping(source = "variantValues", target = "variantValues")
    @Mapping(
            source = "category",
            target = "category",
            qualifiedByName = "toResponseWithoutAttributes"
    )
    VariantResponse toResponse(Variant variant);
}