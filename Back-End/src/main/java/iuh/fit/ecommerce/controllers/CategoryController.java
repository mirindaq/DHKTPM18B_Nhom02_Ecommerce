package iuh.fit.ecommerce.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import iuh.fit.ecommerce.dtos.request.category.CategoryAddRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;
import iuh.fit.ecommerce.services.CategoryService;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<CategoryResponse>>>> getCategories(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "7") int size,
            @RequestParam(required = false ) String categoryName
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get categories success",
                categoryService.getCategories( page, size, categoryName)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<CategoryResponse>> getCategoryById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get category detail success",
                categoryService.getCategoryById( id)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseSuccess<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryAddRequest request
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get category detail success",
                categoryService.updateCategory( id, request)
        ));
    }

    @PutMapping("/change-status/{id}")
    public ResponseEntity<ResponseSuccess<CategoryResponse>> changeStatusCategory(
            @PathVariable Long id
    ) {
        categoryService.changeStatusCategory( id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Change status category success",
                null
        ));
    }


    @PostMapping("")
    public ResponseEntity<ResponseSuccess<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryAddRequest request) {

        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create category success",
                categoryService.createCategory(request)
        ));
    }
}
