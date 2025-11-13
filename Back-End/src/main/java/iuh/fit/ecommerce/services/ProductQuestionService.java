package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.productQuestion.ProductQuestionAddRequest;
import iuh.fit.ecommerce.dtos.request.productQuestion.ProductQuestionAnswerAddRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;
import iuh.fit.ecommerce.dtos.response.productQuestion.ProductQuestionResponse;
import jakarta.validation.Valid;

import java.util.List;

public interface ProductQuestionService {
    ProductQuestionResponse createProductQuestion(@Valid ProductQuestionAddRequest request);

    ResponseWithPagination<List<ProductQuestionResponse>> getProductQuestionsByProductSlug(String slug, int page, int size);

    ProductQuestionResponse createProductQuestionAnswer(@Valid ProductQuestionAnswerAddRequest request);
}
