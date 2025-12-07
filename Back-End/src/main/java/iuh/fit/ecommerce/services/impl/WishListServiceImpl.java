package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.wishList.WishListRequest;
import iuh.fit.ecommerce.dtos.response.wishList.WishListResponse;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Product;
import iuh.fit.ecommerce.entities.User;
import iuh.fit.ecommerce.entities.WishList;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.WishListMapper;
import iuh.fit.ecommerce.repositories.ProductRepository;
import iuh.fit.ecommerce.repositories.WishListRepository;
import iuh.fit.ecommerce.services.WishListService;
import iuh.fit.ecommerce.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishListServiceImpl implements WishListService {

    private final SecurityUtils securityUtil;
    private final WishListRepository wishListRepository;
    private final ProductRepository productRepository;
    private final WishListMapper wishListMapper;

    private Customer getCurrentCustomer() {
        User user = securityUtil.getCurrentUser();
        if (!(user instanceof Customer)) {
            throw new RuntimeException("Current user is not a Customer.");
        }
        return (Customer) user;
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
    }

    @Transactional
    @Override
    public List<WishListResponse> addProductToWishList(WishListRequest request) {
        Long productId = request.getProductId();
        Customer customer = getCurrentCustomer();
        Product product = findProduct(productId);
        Optional<WishList> existingWishList = wishListRepository.findByCustomer_IdAndProduct_Id(
                customer.getId(), productId);
        if (existingWishList.isEmpty()) {
            WishList newWishList = WishList.builder()
                    .customer(customer)
                    .product(product)
                    .build();
            wishListRepository.save(newWishList);
        }
        return getMyWishList();
    }

    @Transactional
    @Override
    public List<WishListResponse> removeProductFromWishList(WishListRequest request) {
        Long productId = request.getProductId();
        Customer customer = getCurrentCustomer();
        wishListRepository.deleteByCustomer_IdAndProduct_Id(customer.getId(), productId);
        return getMyWishList();
    }

    @Override
    public List<WishListResponse> getMyWishList() {
        Customer customer = getCurrentCustomer();
        List<WishList> wishLists = wishListRepository.findAllByCustomer_Id(customer.getId());
        List<Product> products = wishLists.stream()
                .map(WishList::getProduct)
                .collect(Collectors.toList());
        return wishListMapper.toResponseList(products);
    }
}