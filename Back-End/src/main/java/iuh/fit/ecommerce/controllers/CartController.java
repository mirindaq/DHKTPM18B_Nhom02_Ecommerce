package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.cart.CartAddRequest;
import iuh.fit.ecommerce.dtos.request.cart.CartUpdateQuantityRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.cart.CartResponse;
import iuh.fit.ecommerce.services.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.http.HttpStatus.OK;
import static org.springframework.http.HttpStatus.CREATED;

@RestController
@RequestMapping("${api.prefix}/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<CartResponse>> getCart() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get cart success",
                cartService.getOrCreateCart()
        ));
    }

    @PostMapping("/add")
    public ResponseEntity<ResponseSuccess<CartResponse>> addProductToCart(
            @RequestBody CartAddRequest request
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Add product to cart success",
                cartService.addProduct( request)
        ));
    }

    @DeleteMapping("/remove/{productVariantId}")
    public ResponseEntity<ResponseSuccess<CartResponse>> removeProductFromCart(
            @PathVariable Long productVariantId
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Remove product from cart success",
                cartService.removeProduct( productVariantId)
        ));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ResponseSuccess<Void>> clearCart(@RequestParam Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Clear cart success",
                null
        ));
    }

    @PutMapping("/update-quantity")
    public ResponseEntity<ResponseSuccess<CartResponse>> updateCartItemQuantity(
            @RequestBody CartUpdateQuantityRequest request
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update cart item quantity success",
                cartService.updateProductQuantity(request)
        ));
    }
}
