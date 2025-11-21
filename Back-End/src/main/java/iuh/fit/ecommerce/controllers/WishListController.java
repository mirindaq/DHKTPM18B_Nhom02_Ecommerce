package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.wishList.WishListRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.wishList.WishListResponse;
import iuh.fit.ecommerce.services.WishListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/wishlist")
@RequiredArgsConstructor
public class WishListController {

    private final WishListService wishListService;
    @GetMapping("")
    public ResponseEntity<ResponseSuccess<List<WishListResponse>>> getMyWishList() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get user wish list success",
                wishListService.getMyWishList()
        ));
    }

    @PostMapping("/add")
    public ResponseEntity<ResponseSuccess<List<WishListResponse>>> addProductVariantToWishList(
            @RequestBody WishListRequest request
    ) {
        List<WishListResponse> updatedList = wishListService.addProductVariantToWishList(request);
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Add product variant to wish list success",
                updatedList
        ));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<ResponseSuccess<List<WishListResponse>>> removeProductVariantFromWishList(
            @RequestBody WishListRequest request
    ) {
        List<WishListResponse> updatedList = wishListService.removeProductVariantFromWishList(request);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Remove product variant from wish list success",
                updatedList
        ));
    }
}