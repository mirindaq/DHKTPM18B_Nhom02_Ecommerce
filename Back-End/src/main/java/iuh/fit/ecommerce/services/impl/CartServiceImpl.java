package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.cart.CartAddRequest;
import iuh.fit.ecommerce.dtos.request.cart.CartUpdateQuantityRequest;
import iuh.fit.ecommerce.dtos.response.cart.CartResponse;
import iuh.fit.ecommerce.entities.Cart;
import iuh.fit.ecommerce.entities.CartDetail;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.entities.User;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.CartMapper;
import iuh.fit.ecommerce.repositories.CartRepository;
import iuh.fit.ecommerce.repositories.ProductVariantRepository;
import iuh.fit.ecommerce.services.CartService;
import iuh.fit.ecommerce.utils.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final SecurityUtil securityUtil;
    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartMapper cartMapper;

    @Override
    public CartResponse getOrCreateCart() {
        return cartMapper.toResponse(findOrCreateCartForCurrentUser());
    }

    @Override
    public CartResponse addProduct(CartAddRequest request) {
        Cart cart = findOrCreateCartForCurrentUser();
        ProductVariant productVariant = findProductVariant(request.getProductVariantId());

        CartDetail cartDetail = findCartDetail(cart, productVariant);

        if (cartDetail != null) {
            cartDetail.setQuantity(cartDetail.getQuantity() + request.getQuantity());
        } else {
            addNewCartDetail(cart, productVariant, request.getQuantity());
        }

        updateCartTotalItems(cart);

        cartRepository.save(cart);

        return cartMapper.toResponse(cart);
    }

    @Override
    public CartResponse removeProduct(Long productVariantId) {
        Cart cart = findOrCreateCartForCurrentUser();
        ProductVariant productVariant = findProductVariant(productVariantId);

        CartDetail cartDetail = findCartDetail(cart, productVariant);

        if (cartDetail != null) {
            cart.getCartDetails().remove(cartDetail);
            cartRepository.save(cart);
        }

        updateCartTotalItems(cart);
        cartRepository.save(cart);

        return cartMapper.toResponse(cart);
    }

    @Override
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));

        cart.getCartDetails().clear();
        cart.setTotalItems(0L);

        cartRepository.save(cart);
    }

    @Override
    public CartResponse updateProductQuantity(CartUpdateQuantityRequest request) {
        Cart cart = findOrCreateCartForCurrentUser();
        ProductVariant productVariant = findProductVariant(request.getProductVariantId());
        CartDetail cartDetail = findCartDetail(cart, productVariant);

        if (cartDetail == null) {
            throw new ResourceNotFoundException("ProductVariant not found in cart");
        }

        cartDetail.setQuantity(request.getQuantity().longValue());

        if (cartDetail.getQuantity() <= 0) {
            cart.getCartDetails().remove(cartDetail);
        }

        updateCartTotalItems(cart);
        cartRepository.save(cart);

        return cartMapper.toResponse(cart);
    }
    private Cart findOrCreateCartForCurrentUser() {
        User user = securityUtil.getCurrentUser();
        return cartRepository.findByUser_Id(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setTotalItems(0L);
                    return cartRepository.save(newCart);
                });
    }

    private ProductVariant findProductVariant(Long productVariantId) {
        return productVariantRepository.findById(productVariantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant not found"));
    }

    private CartDetail findCartDetail(Cart cart, ProductVariant productVariant) {
        return cart.getCartDetails().stream()
                .filter(cd -> cd.getProductVariant().getId().equals(productVariant.getId()))
                .findFirst()
                .orElse(null);
    }


    private void addNewCartDetail(Cart cart, ProductVariant productVariant, int quantity) {
        CartDetail cartDetail = CartDetail.builder()
                .cart(cart)
                .productVariant(productVariant)
                .quantity((long) quantity)
                .price(productVariant.getPrice())
                .build();
        cart.getCartDetails().add(cartDetail);
    }

    private void updateCartTotalItems(Cart cart) {
        long totalItems = cart.getCartDetails().stream()
                .mapToLong(CartDetail::getQuantity)
                .sum();
        cart.setTotalItems(totalItems);
    }


}
