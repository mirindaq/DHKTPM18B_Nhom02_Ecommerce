package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.categoryBrand.CategoryBrandRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.brand.BrandResponse;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;
import iuh.fit.ecommerce.dtos.response.categoryBrand.CategoryBrandResponse;
import iuh.fit.ecommerce.services.CategoryBrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/category-brands")
@RequiredArgsConstructor
public class CategoryBrandController {

    private final CategoryBrandService categoryBrandService;

    /**
     * Lấy danh sách các Brands thuộc về một Category
     */
    @GetMapping("/categories/{categoryId}/brands")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<BrandResponse>>>> getBrandsByCategoryId(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "7") int size,
            @RequestParam(required = false) String brandName
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get brands by category success",
                categoryBrandService.getBrandsByCategoryId(categoryId, brandName, page, size)
        ));
    }

    /**
     * Lấy danh sách các Categories chứa một Brand
     */
    @GetMapping("/brands/{brandId}/categories")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<CategoryResponse>>>> getCategoriesByBrandId(
            @PathVariable Long brandId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "7") int size,
            @RequestParam(required = false) String categoryName
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get categories by brand success",
                categoryBrandService.getCategoriesByBrandId(brandId, categoryName, page, size)
        ));
    }

    /**
     * Gán (liên kết) một Brand vào một Category
     */
    @PostMapping("/assign")
    public ResponseEntity<ResponseSuccess<CategoryBrandResponse>> assignBrand(
            @Valid @RequestBody CategoryBrandRequest request
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Brand assigned to category successfully",
                categoryBrandService.assignBrandToCategory(request)
        ));
    }

    /**
     * Hủy gán (xóa liên kết) một Brand khỏi một Category
     */
    @DeleteMapping("/unassign")
    public ResponseEntity<ResponseSuccess<Void>> unassignBrand(
            @Valid @RequestBody CategoryBrandRequest request
    ) {
        categoryBrandService.unassignBrandFromCategory(request);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Brand unassigned from category successfully",
                null
        ));
    }
}