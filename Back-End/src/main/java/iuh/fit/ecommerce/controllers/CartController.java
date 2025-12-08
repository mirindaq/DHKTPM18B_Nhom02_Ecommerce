package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.cart.CartAddRequest;
import iuh.fit.ecommerce.dtos.request.cart.CartUpdateQuantityRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.cart.CartResponse;
import iuh.fit.ecommerce.dtos.response.cart.CartWithCustomerResponse;
import iuh.fit.ecommerce.services.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    // Admin/Staff endpoints - Get all carts with items
    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ResponseSuccess<Page<CartWithCustomerResponse>>> getAllCarts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get all carts success",
                cartService.getAllCartsWithItems(page, size, keyword)
        ));
    }

    // Admin/Staff endpoints - Get cart by customer ID
    @GetMapping("/admin/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ResponseSuccess<CartWithCustomerResponse>> getCartByCustomerId(
            @PathVariable Long customerId
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get cart by customer success",
                cartService.getCartByCustomerId(customerId)
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
