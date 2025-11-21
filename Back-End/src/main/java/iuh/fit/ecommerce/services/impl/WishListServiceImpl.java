package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.wishList.WishListRequest;
import iuh.fit.ecommerce.dtos.response.wishList.WishListResponse;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.ProductVariant;
import iuh.fit.ecommerce.entities.User;
import iuh.fit.ecommerce.entities.WishList;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.WishListMapper;
import iuh.fit.ecommerce.repositories.ProductVariantRepository;
import iuh.fit.ecommerce.repositories.WishListRepository;
import iuh.fit.ecommerce.services.WishListService;
import iuh.fit.ecommerce.utils.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishListServiceImpl implements WishListService {

    private final SecurityUtil securityUtil;
    private final WishListRepository wishListRepository;
    private final ProductVariantRepository productVariantRepository;
    private final WishListMapper wishListMapper;

    private Customer getCurrentCustomer() {
        User user = securityUtil.getCurrentUser();
        if (!(user instanceof Customer)) {
            throw new RuntimeException("Current user is not a Customer.");
        }
        return (Customer) user;
    }

    private ProductVariant findProductVariant(Long productVariantId) {
        return productVariantRepository.findById(productVariantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant not found with id: " + productVariantId));
    }

    @Transactional
    @Override
    public List<WishListResponse> addProductVariantToWishList(WishListRequest request) {
        Long productVariantId = request.getProductVariantId();
        Customer customer = getCurrentCustomer();
        ProductVariant productVariant = findProductVariant(productVariantId);
        Optional<WishList> existingWishList = wishListRepository.findByCustomer_IdAndProductVariant_Id(
                customer.getId(), productVariantId);
        if (existingWishList.isEmpty()) {
            WishList newWishList = WishList.builder()
                    .customer(customer)
                    .productVariant(productVariant)
                    .build();
            wishListRepository.save(newWishList);
        }
        return getMyWishList();
    }

    @Transactional
    @Override
    public List<WishListResponse> removeProductVariantFromWishList(WishListRequest request) {
        Long productVariantId = request.getProductVariantId();
        Customer customer = getCurrentCustomer();
        wishListRepository.deleteByCustomer_IdAndProductVariant_Id(customer.getId(), productVariantId);
        return getMyWishList();
    }

    @Override
    public List<WishListResponse> getMyWishList() {
        Customer customer = getCurrentCustomer();
        List<WishList> wishLists = wishListRepository.findAllByCustomer_Id(customer.getId());
        List<ProductVariant> variants = wishLists.stream()
                .map(WishList::getProductVariant)
                .collect(Collectors.toList());
        return wishListMapper.toResponseList(variants);
    }
}