package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.cart.CartDetailResponse;
import iuh.fit.ecommerce.dtos.response.cart.CartResponse;
import iuh.fit.ecommerce.dtos.response.cart.CartWithCustomerResponse;
import iuh.fit.ecommerce.entities.Cart;
import iuh.fit.ecommerce.entities.CartDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(source = "customer.id", target = "userId")
    @Mapping(source = "cartDetails", target = "items")
    @Mapping(source = "cartDetails", target = "totalPrice", qualifiedByName = "calculateTotalPrice")
    @Mapping(source = "id", target = "cartId")
    CartResponse toResponse(Cart cart);

    @Mapping(source = "id", target = "cartId")
    @Mapping(source = "customer.id", target = "customerId")
    @Mapping(source = "customer.fullName", target = "customerName")
    @Mapping(source = "customer.email", target = "customerEmail")
    @Mapping(source = "customer.phone", target = "customerPhone")
    @Mapping(source = "customer.avatar", target = "customerAvatar")
    @Mapping(source = "totalItems", target = "totalItems")
    @Mapping(source = "cartDetails", target = "items")
    @Mapping(source = "cartDetails", target = "totalPrice", qualifiedByName = "calculateTotalPrice")
    @Mapping(source = "modifiedAt", target = "modifiedAt")

    CartWithCustomerResponse toCartWithCustomerResponse(Cart cart);

    @Mapping(source = "productVariant.id", target = "productVariantId")
    @Mapping(source = "productVariant.product.name", target = "productName")
    @Mapping(source = "productVariant.product.thumbnail", target = "productImage")
    @Mapping(source = "productVariant.sku", target = "sku")
    @Mapping(source = "id", target = "id")
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
