package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.entities.Category;
import jakarta.validation.Valid;
import iuh.fit.ecommerce.dtos.request.category.CategoryAddRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryAddRequest request);

    ResponseWithPagination<List<CategoryResponse>> getCategories( int page, int size, String categoryName);

    CategoryResponse getCategoryById(Long id);

    CategoryResponse updateCategory(Long id, @Valid CategoryAddRequest request);

    void changeStatusCategory(Long id);
    Category getCategoryEntityById(Long id);
}
