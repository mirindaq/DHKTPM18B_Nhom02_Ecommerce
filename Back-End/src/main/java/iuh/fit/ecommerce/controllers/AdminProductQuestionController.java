package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.productQuestion.ProductQuestionUpdateStatusRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.productQuestion.ProductQuestionWithProductResponse;
import iuh.fit.ecommerce.services.ProductQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/admin/product-questions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductQuestionController {

    private final ProductQuestionService productQuestionService;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<ProductQuestionWithProductResponse>>>> getAllProductQuestions(
            @RequestParam(defaultValue = "1", required = false) int page,
            @RequestParam(defaultValue = "10", required = false) int size,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long productId,
            @RequestParam(defaultValue = "createdAt", required = false) String sortBy,
            @RequestParam(defaultValue = "desc", required = false) String sortOrder
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get all product questions success",
                productQuestionService.getAllProductQuestionsForAdmin(page, size, status, search, productId, sortBy, sortOrder)
        ));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResponseSuccess<ProductQuestionWithProductResponse>> updateProductQuestionStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody ProductQuestionUpdateStatusRequest request) {

        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update product question status success",
                productQuestionService.updateProductQuestionStatus(id, request.getStatus())
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseSuccess<Void>> deleteProductQuestion(@PathVariable("id") Long id) {
        productQuestionService.deleteProductQuestion(id);

        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Delete product question success",
                null
        ));
    }

    @PatchMapping("/answer/{id}/status")
    public ResponseEntity<ResponseSuccess<ProductQuestionWithProductResponse>> updateProductQuestionAnswerStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody ProductQuestionUpdateStatusRequest request) {

        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update product question answer status success",
                productQuestionService.updateProductQuestionAnswerStatus(id, request.getStatus())
        ));
    }

    @DeleteMapping("/answer/{id}")
    public ResponseEntity<ResponseSuccess<Void>> deleteProductQuestionAnswer(@PathVariable("id") Long id) {
        productQuestionService.deleteProductQuestionAnswer(id);

        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Delete product question answer success",
                null
        ));
    }
}