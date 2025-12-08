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

    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ResponseSuccess<ArticleResponse>> createArticle(
            @Valid @RequestBody ArticleAddRequest articleAddRequest) {

        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create Article success",
                articleService.createArticle(articleAddRequest)
        ));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ResponseSuccess<ArticleResponse>> getArticleBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Article success",
                articleService.getArticleBySlug(slug)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<ArticleResponse>> getArticleById(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Article success",
                articleService.getArticleById(id)
        ));
    }

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<ArticleResponse>>>> getAllArticlesForCustomer(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "7") int limit,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) LocalDate createdDate) {

        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Articles success",
                articleService.getAllArticlesForCustomer(page, limit, title, categoryId, createdDate)
        ));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<ArticleResponse>>>> getAllArticlesForAdmin(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "7") int limit,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) LocalDate createdDate) {

        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Articles success",
                articleService.getAllArticlesForAdmin(page, limit, status, title, categoryId, createdDate)
        ));
    }

//    @PutMapping("/{slug}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
//    public ResponseEntity<ResponseSuccess<ArticleResponse>> updateArticle(
//            @PathVariable String slug,
//            @Valid @RequestBody ArticleAddRequest articleAddRequest) {
//
//        return ResponseEntity.ok(new ResponseSuccess<>(
//                OK,
//                "Update Article success",
//                articleService.updateArticle(slug, articleAddRequest)
//        ));
//    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ResponseSuccess<ArticleResponse>> updateArticle(
            @PathVariable Long id,
            @Valid @RequestBody ArticleAddRequest articleAddRequest) {

        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update Article success",
                articleService.updateArticle(id, articleAddRequest)
        ));
    }

//    @PutMapping("/change-status/{id}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
//    public ResponseEntity<ResponseSuccess<Void>> updateArticleStatus(
//            @PathVariable Long id,
//            @RequestParam Boolean status) {
//
//        articleService.updateArticleStatus(id, status);
//        return ResponseEntity.ok(new ResponseSuccess<>(
//                OK,
//                "Change status article success",
//                null
//        ));
//    }

    @PutMapping("/change-status/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ResponseSuccess<Void>> updateArticleStatus(
            @PathVariable Long id){
        articleService.changeStatusArticle(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Change status article success",
                null
        ));
    }
}
