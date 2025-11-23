package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.wishList.WishListRequest;
import iuh.fit.ecommerce.dtos.response.wishList.WishListResponse;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface WishListService {
    @Transactional
    List<WishListResponse> addProductVariantToWishList(WishListRequest request);

    @Transactional
    List<WishListResponse> removeProductVariantFromWishList(WishListRequest request);

    List<WishListResponse> getMyWishList();
}
