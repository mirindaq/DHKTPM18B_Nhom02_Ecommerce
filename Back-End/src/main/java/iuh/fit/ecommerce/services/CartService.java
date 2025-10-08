package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.cart.CartAddRequest;
import iuh.fit.ecommerce.dtos.request.cart.CartUpdateQuantityRequest;
import iuh.fit.ecommerce.dtos.response.cart.CartResponse;

public interface CartService {
    CartResponse getOrCreateCart();

    CartResponse addProduct(CartAddRequest request);

    CartResponse removeProduct(Long productVariantId);

    void clearCart(Long userId);

    CartResponse updateProductQuantity(CartUpdateQuantityRequest request);
}
