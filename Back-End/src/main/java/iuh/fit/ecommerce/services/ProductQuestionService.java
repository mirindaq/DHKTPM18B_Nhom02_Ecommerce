package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.productQuestion.ProductQuestionAddRequest;
import iuh.fit.ecommerce.dtos.request.productQuestion.ProductQuestionAnswerAddRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;
import iuh.fit.ecommerce.dtos.response.productQuestion.ProductQuestionResponse;
import iuh.fit.ecommerce.dtos.response.productQuestion.ProductQuestionWithProductResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import java.util.List;

public interface ProductQuestionService {
    ProductQuestionResponse createProductQuestion(@Valid ProductQuestionAddRequest request);

    ResponseWithPagination<List<ProductQuestionResponse>> getProductQuestionsByProductSlug(String slug, int page, int size);

    ProductQuestionResponse createProductQuestionAnswer(@Valid ProductQuestionAnswerAddRequest request);


    ResponseWithPagination<List<ProductQuestionWithProductResponse>> getAllProductQuestionsForAdmin(
            int page, int size, Boolean status, String search, Long productId, String sortBy, String sortOrder);

    @Transactional
    ProductQuestionWithProductResponse updateProductQuestionStatus(Long id, Boolean status);

    @Transactional
    void deleteProductQuestion(Long id);

    @Transactional
    ProductQuestionWithProductResponse updateProductQuestionAnswerStatus(Long answerId, Boolean status);

    @Transactional
    void deleteProductQuestionAnswer(Long answerId);
}
