package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.cart.CartDetailResponse;
import iuh.fit.ecommerce.dtos.response.cart.CartResponse;
import iuh.fit.ecommerce.entities.Cart;
import iuh.fit.ecommerce.entities.CartDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "cartDetails", target = "items")
    @Mapping(source = "cartDetails", target = "totalPrice", qualifiedByName = "calculateTotalPrice")
    @Mapping(source = "id", target = "cartId")
    CartResponse toResponse(Cart cart);

    @Mapping(source = "productVariant.id", target = "productVariantId")
    @Mapping(source = "productVariant.product.name", target = "productName")
    @Mapping(source = "productVariant.product.thumbnail", target = "productImage")
    @Mapping(source = "productVariant.sku", target = "sku")
    CartDetailResponse toItemResponse(CartDetail cartDetail);

    @Named("calculateTotalPrice")
    default double calculateTotalPrice(List<CartDetail> cartDetails) {
        if (cartDetails == null) return 0;
        return cartDetails.stream()
                .mapToDouble(cd -> (cd.getPrice() != null ? cd.getPrice() : 0) *
                        (cd.getQuantity() != null ? cd.getQuantity() : 0))
                .sum();
    }

}
