package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.categoryBrand.SetBrandsForCategoryRequest; // <-- THÊM
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.brand.BrandResponse;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse; // Giả định bạn có DTO này
// import iuh.fit.ecommerce.dtos.response.categoryBrand.CategoryBrandResponse; // <-- XÓA
import java.util.List;

public interface CategoryBrandService {

    void setBrandsForCategory(SetBrandsForCategoryRequest request);


    List<BrandResponse> getBrandsByCategoryId(
            Long categoryId, String brandName
    );

    List<CategoryResponse> getCategoriesByBrandId(
            Long brandId, String categoryName
    );
}