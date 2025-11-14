package iuh.fit.ecommerce.services;

// --- SỬA IMPORT ---
// import iuh.fit.ecommerce.dtos.request.categoryBrand.CategoryBrandRequest; // <-- XÓA
import iuh.fit.ecommerce.dtos.request.categoryBrand.SetBrandsForCategoryRequest; // <-- THÊM
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.brand.BrandResponse;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse; // Giả định bạn có DTO này
// import iuh.fit.ecommerce.dtos.response.categoryBrand.CategoryBrandResponse; // <-- XÓA
import java.util.List;

public interface CategoryBrandService {

    // --- XÓA HÀM CŨ ---
    // CategoryBrandResponse assignBrandToCategory(CategoryBrandRequest request);

    // --- XÓA HÀM CŨ ---
    // void unassignBrandFromCategory(CategoryBrandRequest request);

    // --- THÊM HÀM MỚI ---
    /**
     * Đặt lại toàn bộ danh sách thương hiệu cho một danh mục.
     * Sẽ xóa tất cả liên kết cũ và thêm các liên kết mới.
     * @param request Chứa categoryId và List<brandIds>
     */
    void setBrandsForCategory(SetBrandsForCategoryRequest request);
    // --- HẾT HÀM MỚI ---

    /**
     * Lấy danh sách (phân trang) các Brands thuộc về một Category.
     * (Giữ nguyên)
     */
    ResponseWithPagination<List<BrandResponse>> getBrandsByCategoryId(
            Long categoryId, String brandName, int page, int size
    );

    /**
     * Lấy danh sách (phân trang) các Categories chứa một Brand.
     * (Giữ nguyên)
     */
    ResponseWithPagination<List<CategoryResponse>> getCategoriesByBrandId(
            Long brandId, String categoryName, int page, int size
    );
}