package iuh.fit.ecommerce.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import iuh.fit.ecommerce.dtos.request.article.ArticleCategoryAddRequest;
import iuh.fit.ecommerce.dtos.response.article.ArticleCategoryResponse;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.services.ArticleCategoryService;
import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/article-categories")
@RequiredArgsConstructor
public class ArticleCategoryController {

    private final ArticleCategoryService articleCategoryService;

    @PostMapping(value = "")
    public ResponseEntity<ResponseSuccess<ArticleCategoryResponse>> createCategory(
            @Valid @RequestBody ArticleCategoryAddRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create Article Category success",
                articleCategoryService.createCategory(request)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<ArticleCategoryResponse>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Article Category success",
                articleCategoryService.getCategoryById(id)
        ));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ResponseSuccess<ArticleCategoryResponse>> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Article Category success",
                articleCategoryService.getCategoryBySlug(slug)
        ));
    }

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<ArticleCategoryResponse>>>> getAllCategories(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "7") int limit,
            @RequestParam(required = false) String title) {

        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Article Categories success",
                articleCategoryService.getAllCategories(page, limit, title)
        ));
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<ResponseSuccess<ArticleCategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody ArticleCategoryAddRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update Article Category success",
                articleCategoryService.updateCategory(id, request)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseSuccess<Void>> deleteCategory(@PathVariable Long id) {
        articleCategoryService.deleteCategory(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Delete Article Category success",
                null
        ));
    }
}