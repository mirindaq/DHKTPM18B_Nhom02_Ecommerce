package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.cart.CartAddRequest;
import iuh.fit.ecommerce.dtos.request.cart.CartUpdateQuantityRequest;
import iuh.fit.ecommerce.dtos.response.cart.CartResponse;
import iuh.fit.ecommerce.dtos.response.cart.CartWithCustomerResponse;
import iuh.fit.ecommerce.entities.*;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.CartMapper;
import iuh.fit.ecommerce.repositories.CartRepository;
import iuh.fit.ecommerce.repositories.ProductVariantRepository;
import iuh.fit.ecommerce.services.CartService;
import iuh.fit.ecommerce.services.PromotionService;
import iuh.fit.ecommerce.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final SecurityUtils securityUtils;
    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PromotionService promotionService;
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
        Cart cart = cartRepository.findByCustomer_Id(userId)
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
        Customer customer = securityUtils.getCurrentCustomer();
        return cartRepository.findByCustomer_Id(customer.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setCustomer(customer);
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
        Promotion promotion = promotionService.getBestPromotionForVariant(productVariant);
        CartDetail cartDetail = CartDetail.builder()
                .cart(cart)
                .productVariant(productVariant)
                .quantity((long) quantity)
                .price(productVariant.getPrice())
                .discount(promotion != null ? promotion.getDiscount() : 0.0)
                .build();
        cart.getCartDetails().add(cartDetail);
    }

    private void updateCartTotalItems(Cart cart) {
        long totalItems = cart.getCartDetails().stream()
                .mapToLong(CartDetail::getQuantity)
                .sum();
        cart.setTotalItems(totalItems);
    }

    // Admin methods
    @Override
    public Page<CartWithCustomerResponse> getAllCartsWithItems(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "totalItems"));
        
        Page<Cart> carts;
        if (keyword != null && !keyword.trim().isEmpty()) {
            carts = cartRepository.searchCartsByCustomer(keyword.trim(), pageable);
        } else {
            carts = cartRepository.findAllCartsWithItemsPaged(pageable);
        }
        
        return carts.map(cartMapper::toCartWithCustomerResponse);
    }

    @Override
    public CartWithCustomerResponse getCartByCustomerId(Long customerId) {
        Cart cart = cartRepository.findByCustomer_Id(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for customer"));
        return cartMapper.toCartWithCustomerResponse(cart);
    }

}
