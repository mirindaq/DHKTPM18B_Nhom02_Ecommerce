package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.configurations.CacheConfig;
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
import iuh.fit.ecommerce.services.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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

    private final CategoryBrandRepository categoryBrandRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;
    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    @CacheEvict(value = CacheConfig.CATEGORY_BRAND_CACHE, allEntries = true)
    public void setBrandsForCategory(SetBrandsForCategoryRequest request) {
        Category category = categoryService.getCategoryEntityById(request.getCategoryId());

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


    @Override
    @Cacheable(value = CacheConfig.CATEGORY_BRAND_CACHE, key = "'category:' + #categoryId + ':brandName:' + (#brandName != null ? #brandName : 'all')")
    public List<BrandResponse> getBrandsByCategoryId(
            Long categoryId, String brandName
    ) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }


        List<Brand> brands = categoryBrandRepository.findBrandsByCategoryIdAndName(
                categoryId, brandName
        );

        return brands.stream().map(brandMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = CacheConfig.CATEGORY_BRAND_CACHE, key = "'brand:' + #brandId + ':categoryName:' + (#categoryName != null ? #categoryName : 'all')")
    public List<CategoryResponse> getCategoriesByBrandId(
            Long brandId, String categoryName
    ) {
        if (!brandRepository.existsById(brandId)) {
            throw new ResourceNotFoundException("Brand not found with id: " + brandId);
        }

        List<Category> categories = categoryBrandRepository.findCategoriesByBrandIdAndName(
                brandId, categoryName
        );

        return categories.stream().map(categoryMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = CacheConfig.CATEGORY_BRAND_CACHE, key = "'category-slug:' + #slug")
    public List<BrandResponse> getBrandsByCategorySlug(String slug) {
        List<Brand> brands = categoryBrandRepository.findBrandsByCategorySlug(slug);
        return brands.stream().map(brandMapper::toResponse).collect(Collectors.toList());
    }
}