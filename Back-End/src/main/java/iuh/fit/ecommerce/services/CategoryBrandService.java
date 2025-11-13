package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.categoryBrand.CategoryBrandRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.brand.BrandResponse;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse; // Giả định bạn có DTO này
import iuh.fit.ecommerce.dtos.response.categoryBrand.CategoryBrandResponse;
import java.util.List;

public interface CategoryBrandService {

    /**
     * Gán (liên kết) một Brand vào một Category.
     * @param request Chứa categoryId và brandId
     * @return Thông tin của liên kết vừa được tạo
     */
    CategoryBrandResponse assignBrandToCategory(CategoryBrandRequest request);

    /**
     * Hủy gán (xóa liên kết) một Brand khỏi một Category.
     * @param request Chứa categoryId và brandId của liên kết cần xóa
     */
    void unassignBrandFromCategory(CategoryBrandRequest request);

    /**
     * Lấy danh sách (phân trang) các Brands thuộc về một Category.
     * @param categoryId ID của Category
     * @param brandName Tên Brand để tìm kiếm (có thể null)
     * @param page Trang hiện tại
     * @param size Số lượng trên 1 trang
     * @return Một trang chứa danh sách các Brand
     */
    ResponseWithPagination<List<BrandResponse>> getBrandsByCategoryId(
            Long categoryId, String brandName, int page, int size
    );

    /**
     * Lấy danh sách (phân trang) các Categories chứa một Brand.
     * @param brandId ID của Brand
     * @param categoryName Tên Category để tìm kiếm (có thể null)
     * @param page Trang hiện tại
     * @param size Số lượng trên 1 trang
     * @return Một trang chứa danh sách các Category
     */
    ResponseWithPagination<List<CategoryResponse>> getCategoriesByBrandId(
            Long brandId, String categoryName, int page, int size
    );
}