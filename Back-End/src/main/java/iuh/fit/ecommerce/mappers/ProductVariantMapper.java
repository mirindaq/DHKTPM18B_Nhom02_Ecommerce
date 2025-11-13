package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.product.ProductVariantDescriptionResponse;
import iuh.fit.ecommerce.dtos.response.product.ProductVariantResponse;
import iuh.fit.ecommerce.entities.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = { ProductVariantValueMapper.class })
public interface ProductVariantMapper {
    ProductVariantResponse toResponse(ProductVariant productVariant);

    @Mapping(target = "name", expression = "java(productVariant.getProduct().getName() + \" - \" + getVariantValues(productVariant))")
    @Mapping(target = "price", source = "productVariant.price")
//    @Mapping(target = "oldPrice", source = "productVariant.oldPrice")
    @Mapping(target = "sku", source = "productVariant.sku")
    @Mapping(target = "stock", source = "productVariant.stock")
    @Mapping(target = "brandName", source = "productVariant.product.brand.name")
    @Mapping(target = "categoryName", source = "productVariant.product.category.name")
    @Mapping(target = "thumbnail", source = "productVariant.product.thumbnail")
    ProductVariantDescriptionResponse toProductVariantDescriptionResponse(ProductVariant productVariant);

    List<ProductVariantDescriptionResponse> toProductVariantDescriptionResponse(List<ProductVariant> productVariants);


    default String getVariantValues(ProductVariant productVariant) {
        return productVariant.getProductVariantValues().stream()
                .map(vv -> vv.getVariantValue().getValue())
                .collect(Collectors.joining(", "));
    }

}