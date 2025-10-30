package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.article.ArticleCategoryAddRequest;
import iuh.fit.ecommerce.dtos.response.article.ArticleCategoryResponse;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import java.util.List;

public interface ArticleCategoryService {

    ArticleCategoryResponse createCategory(ArticleCategoryAddRequest request);

    ArticleCategoryResponse getCategoryBySlug(String slug);

    ArticleCategoryResponse getCategoryById(Long id);

    ArticleCategoryResponse updateCategory(Long id, ArticleCategoryAddRequest request);

    void deleteCategory(Long id);

    ResponseWithPagination<List<ArticleCategoryResponse>> getAllCategories(int page, int limit, String title);
}