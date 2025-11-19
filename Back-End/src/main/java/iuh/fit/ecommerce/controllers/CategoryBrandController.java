package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.categoryBrand.SetBrandsForCategoryRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.brand.BrandResponse;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;
import iuh.fit.ecommerce.services.CategoryBrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/category-brands")
@RequiredArgsConstructor
public class CategoryBrandController {

    private final CategoryBrandService categoryBrandService;

    @GetMapping("/categories/{categoryId}/brands")
    public ResponseEntity<ResponseSuccess<List<BrandResponse>>> getBrandsByCategoryId(
            @PathVariable Long categoryId,
            @RequestParam(required = false) String brandName
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get brands by category success",
                categoryBrandService.getBrandsByCategoryId(categoryId, brandName)
        ));
    }

    @GetMapping("/brands/{brandId}/categories")
    public ResponseEntity<ResponseSuccess<List<CategoryResponse>>> getCategoriesByBrandId(
            @PathVariable Long brandId,
            @RequestParam(required = false) String categoryName
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get categories by brand success",
                categoryBrandService.getCategoriesByBrandId(brandId, categoryName)
        ));
    }

    @PostMapping("/set-brands")
    public ResponseEntity<ResponseSuccess<Void>> setBrandsForCategory(
            @Valid @RequestBody SetBrandsForCategoryRequest request
    ) {
        categoryBrandService.setBrandsForCategory(request);

        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Cập nhật danh sách thương hiệu cho danh mục thành công",
                null
        ));
    }

    @GetMapping("/categories/slug/{slug}/brands")
    public ResponseEntity<ResponseSuccess<List<BrandResponse>>> getBrandsByCategorySlug(
            @PathVariable String slug
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get brands by category success",
                categoryBrandService.getBrandsByCategorySlug(slug)
        ));
    }
}