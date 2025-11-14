package iuh.fit.ecommerce.controllers;

// --- SỬA IMPORT: Xóa DTO cũ, thêm DTO mới ---
// import iuh.fit.ecommerce.dtos.request.categoryBrand.CategoryBrandRequest; // <-- XÓA
import iuh.fit.ecommerce.dtos.request.categoryBrand.SetBrandsForCategoryRequest; // <-- THÊM
// --- HẾT SỬA IMPORT ---

import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.brand.BrandResponse;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;
// import iuh.fit.ecommerce.dtos.response.categoryBrand.CategoryBrandResponse; // <-- XÓA (Không cần nữa)
import iuh.fit.ecommerce.services.CategoryBrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// import static org.springframework.http.HttpStatus.CREATED; // <-- XÓA
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/category-brands")
@RequiredArgsConstructor
public class CategoryBrandController {

    private final CategoryBrandService categoryBrandService;

    /**
     * Lấy danh sách các Brands thuộc về một Category
     * (Giữ nguyên)
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
     * (Giữ nguyên)
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

    // --- THÊM API MỚI ---
    /**
     * API MỚI: Xóa tất cả brand cũ khỏi category,
     * và gán danh sách brand mới vào.
     * Đây là API duy nhất cho việc "Gán/Cập nhật"
     * @POST /api/v1/category-brands/set-brands
     */
    @PostMapping("/set-brands")
    public ResponseEntity<ResponseSuccess<Void>> setBrandsForCategory(
            @Valid @RequestBody SetBrandsForCategoryRequest request
    ) {
        // Bạn cần tạo hàm này trong Service:
        // 1. Dùng @Transactional
        // 2. Xóa hết (deleteAllByCategoryId(request.getCategoryId()))
        // 3. Gán mới (saveAll(newLinks))
        categoryBrandService.setBrandsForCategory(request);

        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Cập nhật danh sách thương hiệu cho danh mục thành công",
                null
        ));
    }
    // --- HẾT API MỚI ---


    // --- XÓA API CŨ ---
    /*
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
    */

    // --- XÓA API CŨ ---
    /*
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
    */
}