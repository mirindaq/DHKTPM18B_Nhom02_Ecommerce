package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.categoryBrand.CategoryBrandRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.brand.BrandResponse;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;
import iuh.fit.ecommerce.dtos.response.categoryBrand.CategoryBrandResponse;
import iuh.fit.ecommerce.entities.Brand;
import iuh.fit.ecommerce.entities.Category;
import iuh.fit.ecommerce.entities.CategoryBrand;
import iuh.fit.ecommerce.exceptions.custom.ConflictException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.BrandMapper;
import iuh.fit.ecommerce.mappers.CategoryBrandMapper;
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

@Service
@RequiredArgsConstructor
public class CategoryBrandServiceImpl implements CategoryBrandService {

    // Repositories
    private final CategoryBrandRepository categoryBrandRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    // Mappers
    private final CategoryBrandMapper categoryBrandMapper;
    private final BrandMapper brandMapper;
    private final CategoryMapper categoryMapper; // Giả định bạn có CategoryMapper

    @Override
    @Transactional
    public CategoryBrandResponse assignBrandToCategory(CategoryBrandRequest request) {
        // 1. Validate (giống như validateBrandName)
        validateAssignment(request.getCategoryId(), request.getBrandId());

        // 2. Lấy các entity liên quan (giống get...EntityById)
        Category category = getCategoryEntityById(request.getCategoryId());
        Brand brand = getBrandEntityById(request.getBrandId());

        // 3. Tạo entity mới (giống mapRequestToBrand)
        CategoryBrand newAssignment = CategoryBrand.builder()
                .category(category)
                .brand(brand)
                .build();

        // 4. Lưu
        categoryBrandRepository.save(newAssignment);

        // 5. Trả về response đã map
        return categoryBrandMapper.toResponse(newAssignment);
    }

    @Override
    @Transactional
    public void unassignBrandFromCategory(CategoryBrandRequest request) {
        // 1. Lấy entity liên kết
        CategoryBrand assignment = getCategoryBrandEntity(
                request.getCategoryId(),
                request.getBrandId()
        );

        // 2. Xóa
        categoryBrandRepository.delete(assignment);
    }

    @Override
    public ResponseWithPagination<List<BrandResponse>> getBrandsByCategoryId(
            Long categoryId, String brandName, int page, int size
    ) {
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

    /**
     * Lấy entity liên kết CategoryBrand hoặc ném 404
     */
    private CategoryBrand getCategoryBrandEntity(Long categoryId, Long brandId) {
        return categoryBrandRepository.findByCategoryIdAndBrandId(categoryId, brandId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Assignment not found for Category ID %d and Brand ID %d", categoryId, brandId)
                ));
    }

    /**
     * Kiểm tra xem liên kết đã tồn tại hay chưa (giống validateBrandName)
     */
    private void validateAssignment(Long categoryId, Long brandId) {
        if (categoryBrandRepository.existsByCategoryIdAndBrandId(categoryId, brandId)) {
            throw new ConflictException("Brand is already assigned to this category");
        }
        // Không cần trường hợp "update" như validateBrandName
        // vì chúng ta không "update" một liên kết, chúng ta xóa và tạo mới.
    }
}