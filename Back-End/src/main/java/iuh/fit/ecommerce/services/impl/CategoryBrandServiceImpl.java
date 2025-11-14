package iuh.fit.ecommerce.services.impl;

// --- SỬA IMPORT ---
// import iuh.fit.ecommerce.dtos.request.categoryBrand.CategoryBrandRequest; // <-- XÓA
import iuh.fit.ecommerce.dtos.request.categoryBrand.SetBrandsForCategoryRequest; // <-- THÊM
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.brand.BrandResponse;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;
// import iuh.fit.ecommerce.dtos.response.categoryBrand.CategoryBrandResponse; // <-- XÓA
import iuh.fit.ecommerce.entities.Brand;
import iuh.fit.ecommerce.entities.Category;
import iuh.fit.ecommerce.entities.CategoryBrand;
// import iuh.fit.ecommerce.exceptions.custom.ConflictException; // <-- XÓA
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.BrandMapper;
// import iuh.fit.ecommerce.mappers.CategoryBrandMapper; // <-- XÓA (Trừ khi bạn dùng ở đâu khác)
import iuh.fit.ecommerce.mappers.CategoryMapper;
import iuh.fit.ecommerce.repositories.BrandRepository;
import iuh.fit.ecommerce.repositories.CategoryBrandRepository;
import iuh.fit.ecommerce.repositories.CategoryRepository;
import iuh.fit.ecommerce.services.CategoryBrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors; // <-- THÊM

@Service
@RequiredArgsConstructor
public class CategoryBrandServiceImpl implements CategoryBrandService {

    // Repositories
    private final CategoryBrandRepository categoryBrandRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    // Mappers
    // private final CategoryBrandMapper categoryBrandMapper; // <-- XÓA
    private final BrandMapper brandMapper;
    private final CategoryMapper categoryMapper; // Giả định bạn có CategoryMapper


    // --- XÓA HÀM CŨ ---
    /*
    @Override
    @Transactional
    public CategoryBrandResponse assignBrandToCategory(CategoryBrandRequest request) {
        ...
    }
    */

    // --- XÓA HÀM CŨ ---
    /*
    @Override
    @Transactional
    public void unassignBrandFromCategory(CategoryBrandRequest request) {
        ...
    }
    */

    // --- THÊM HÀM MỚI ---
    @Override
    @Transactional
    public void setBrandsForCategory(SetBrandsForCategoryRequest request) {
        // 1. Lấy category (hoặc ném 404 nếu không tìm thấy)
        Category category = getCategoryEntityById(request.getCategoryId());

        // 2. Xóa tất cả liên kết cũ của category này
        // (YÊU CẦU: bạn cần thêm hàm này vào CategoryBrandRepository, xem bước 3)
        categoryBrandRepository.deleteAllByCategoryId(request.getCategoryId());

        // 3. Nếu danh sách ID mới rỗng hoặc null, thì dừng lại (chỉ xóa)
        if (request.getBrandIds() == null || request.getBrandIds().isEmpty()) {
            return;
        }

        // 4. Lấy tất cả entity Brand (tránh N+1 query)
        // Hàm findAllById sẽ chỉ trả về các Brand thực sự tồn tại
        List<Brand> brands = brandRepository.findAllById(request.getBrandIds());

        // 5. Tạo danh sách liên kết mới
        List<CategoryBrand> newAssignments = brands.stream()
                .map(brand -> CategoryBrand.builder()
                        .category(category)
                        .brand(brand)
                        .build())
                .collect(Collectors.toList());

        // 6. Lưu tất cả liên kết mới vào DB
        categoryBrandRepository.saveAll(newAssignments);
    }
    // --- HẾT HÀM MỚI ---


    @Override
    public ResponseWithPagination<List<BrandResponse>> getBrandsByCategoryId(
            Long categoryId, String brandName, int page, int size
    ) {
// ... (Giữ nguyên logic hàm này)
        // 1. Kiểm tra Category có tồn tại không
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }

        // 2. Chuẩn bị phân trang (giống getBrands)
        page = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(page, size);

        // 3. Lấy dữ liệu từ Repo
        // (Sử dụng hàm query đã viết ở bước trước, hàm này đã xử lý brandName == null)
        Page<Brand> brandPage = categoryBrandRepository.findBrandsByCategoryIdAndName(
                categoryId, brandName, pageable
        );

        // 4. Đóng gói response (giống getBrands)
        return ResponseWithPagination.fromPage(brandPage, brandMapper::toResponse);
    }

    @Override
    public ResponseWithPagination<List<CategoryResponse>> getCategoriesByBrandId(
            Long brandId, String categoryName, int page, int size
    ) {
// ... (Giữ nguyên logic hàm này)
        // 1. Kiểm tra Brand có tồn tại không
        if (!brandRepository.existsById(brandId)) {
            throw new ResourceNotFoundException("Brand not found with id: " + brandId);
        }

        // 2. Chuẩn bị phân trang
        page = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(page, size);

        // 3. Lấy dữ liệu từ Repo
        Page<Category> categoryPage = categoryBrandRepository.findCategoriesByBrandIdAndName(
                brandId, categoryName, pageable
        );

        // 4. Đóng gói response
        return ResponseWithPagination.fromPage(categoryPage, categoryMapper::toResponse);
    }

    // --- PRIVATE HELPERS ---

    /**
     * Lấy entity Category hoặc ném 404
     */
    private Category getCategoryEntityById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    /**
     * Lấy entity Brand hoặc ném 404 (giống trong BrandServiceImpl)
     */
    private Brand getBrandEntityById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
    }

    // --- XÓA HELPER CŨ ---
    /*
    private CategoryBrand getCategoryBrandEntity(Long categoryId, Long brandId) {
        ...
    }
    */

    // --- XÓA HELPER CŨ ---
    /*
    private void validateAssignment(Long categoryId, Long brandId) {
        ...
    }
    */
}