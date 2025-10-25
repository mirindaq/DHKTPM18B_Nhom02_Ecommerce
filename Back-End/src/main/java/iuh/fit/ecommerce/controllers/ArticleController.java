package iuh.fit.ecommerce.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import iuh.fit.ecommerce.dtos.request.article.ArticleAddRequest;
import iuh.fit.ecommerce.dtos.response.article.ArticleResponse;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.services.ArticleService;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    // ✅ Chỉ STAFF mới được tạo bài viết
    @PostMapping("")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ResponseSuccess<ArticleResponse>> createArticle(
            @Valid @RequestBody ArticleAddRequest articleAddRequest) {

        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create Article success",
                articleService.createArticle(articleAddRequest)
        ));
    }

    // ✅ Ai cũng có thể xem bài viết theo slug
    @GetMapping("/{slug}")
    public ResponseEntity<ResponseSuccess<ArticleResponse>> getArticleBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Article success",
                articleService.getArticleBySlug(slug)
        ));
    }

    // ✅ Ai cũng có thể xem danh sách bài viết
    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<ArticleResponse>>>> getAllArticles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) LocalDate createdDate) {

        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Articles success",
                articleService.getAllArticles(page, limit, status, title, categoryId, createdDate)
        ));
    }

    // ✅ Chỉ STAFF mới được chỉnh sửa bài viết
    @PutMapping("/{slug}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ResponseSuccess<ArticleResponse>> updateArticle(
            @PathVariable String slug,
            @Valid @RequestBody ArticleAddRequest articleAddRequest) {

        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update Article success",
                articleService.updateArticle(slug, articleAddRequest)
        ));
    }

    // ✅ Chỉ STAFF mới được thay đổi trạng thái bài viết
    @PutMapping("/change-status/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ResponseSuccess<Void>> updateArticleStatus(
            @PathVariable Long id,
            @RequestParam Boolean status) {

        articleService.updateArticleStatus(id, status);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Change status article success",
                null
        ));
    }
}
