package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.request.product.ProductAddRequest;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.entities.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(
        componentModel = "spring",
        uses = {
                ProductAttributeValueMapper.class,
                ProductVariantMapper.class,
                VariantValueMapper.class,
                AttributeMapper.class,
                ProductImageMapper.class,
                ProductVariantValueMapper.class
        }
)
public interface ProductMapper {

    @Mapping(target = "attributes", ignore = true)
    @Mapping(target = "productImages", ignore = true)
    void requestToEntity(ProductAddRequest productAddRequest, @MappingTarget Product product);

    @Mapping(source = "productVariants", target = "variants")
    @Mapping(source = "brand.id", target = "brandId")
    @Mapping(source = "category.id", target = "categoryId")
    ProductResponse toResponse(Product product);
}
