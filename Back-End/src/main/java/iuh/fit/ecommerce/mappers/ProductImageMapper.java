package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.entities.ProductImage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductImageMapper {
    default String toResponse(ProductImage productImage) {
        return productImage != null ? productImage.getUrl() : null;
    }
}