package iuh.fit.ecommerce.mappers;

import org.mapstruct.Mapper;
import iuh.fit.ecommerce.dtos.response.brand.BrandResponse;
import iuh.fit.ecommerce.entities.Brand;

@Mapper(componentModel = "spring")
public interface BrandMapper {

    BrandResponse toResponse(Brand brand);
}
