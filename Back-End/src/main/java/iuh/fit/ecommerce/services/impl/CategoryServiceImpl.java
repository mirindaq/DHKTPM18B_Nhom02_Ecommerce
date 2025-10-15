package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.utils.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import iuh.fit.ecommerce.dtos.request.category.AttributeAddRequest;
import iuh.fit.ecommerce.dtos.request.category.CategoryAddRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.category.CategoryResponse;
import iuh.fit.ecommerce.entities.Attribute;
import iuh.fit.ecommerce.entities.Category;
import iuh.fit.ecommerce.exceptions.custom.ConflictException;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.CategoryMapper;
import iuh.fit.ecommerce.repositories.AttributeRepository;
import iuh.fit.ecommerce.repositories.CategoryRepository;
import iuh.fit.ecommerce.services.CategoryService;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final AttributeRepository attributeRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryAddRequest request) {
        validateCategoryName(request.getName(), null);

        Category category = new Category();
        mapRequestToCategory(category, request);
        categoryRepository.save(category);

        category.setAttributes(processAttributes(category, request.getAttributes(), Collections.emptyList()));
        return categoryMapper.toResponse(category);
    }


    @Override
    public ResponseWithPagination<List<CategoryResponse>> getCategories(int page, int size, String categoryName) {

        page = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(page, size);
        Page<Category> categoryPage;

        if (categoryName != null && !categoryName.isBlank()) {
            categoryPage = categoryRepository.findByNameContainingIgnoreCase(categoryName, pageable);
        } else {
            categoryPage = categoryRepository.findAll(pageable);
        }
        return ResponseWithPagination.fromPage(categoryPage,categoryMapper::toResponse);
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        return categoryMapper.toResponse(getCategoryEntityById(id));
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryAddRequest request) {
        Category category = getCategoryEntityById(id);

        validateCategoryName(request.getName(), category);

        mapRequestToCategory(category, request);

        // Process attributes: giữ lại, xóa, thêm mới
        category.setAttributes(processAttributes(category, request.getAttributes(), category.getAttributes()));

        categoryRepository.save(category);

        return categoryMapper.toResponse(category);
    }

    @Override
    public void changeStatusCategory(Long id) {
        Category category = getCategoryEntityById(id);
        category.setStatus(!category.getStatus());
        categoryRepository.save(category);
    }

    public Category getCategoryEntityById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private void validateCategoryName(String name, Category existingCategory) {
        if (existingCategory == null && categoryRepository.existsByName(name)) {
            throw new ConflictException("Category name already exists");
        }
        if (existingCategory != null && !name.equals(existingCategory.getName()) &&
                categoryRepository.existsByName(name)) {
            throw new ConflictException("Category name already exists");
        }
    }

    private void mapRequestToCategory(Category category, CategoryAddRequest request) {
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImage(request.getImage());
        category.setStatus(Boolean.TRUE.equals(request.getStatus()));
        category.setSlug(StringUtils.normalizeString(request.getName()));
    }

    /**
     * Xử lý attribute cho cả create và update
     * @param category: category hiện tại
     * @param attrsReq: request attribute từ client
     * @param existingAttrs: danh sách attribute hiện có (trống nếu create)
     * @return danh sách attribute đã cập nhật
     */
    private List<Attribute> processAttributes(Category category,
                                              List<AttributeAddRequest> attrsReq,
                                              List<Attribute> existingAttrs) {

        List<AttributeAddRequest> requestList = Optional.ofNullable(attrsReq).orElse(List.of());

        // Dedupe attribute request
        LinkedHashMap<String, String> dedup = requestList.stream()
                .filter(ar -> ar != null && ar.getName() != null && !ar.getName().isBlank())
                .collect(Collectors.toMap(
                        ar -> ar.getName().trim().toLowerCase(),
                        ar -> ar.getName().trim(),
                        (existing, replacement) -> existing,
                        LinkedHashMap::new
                ));

        // Cập nhật attribute cũ: nếu không còn trong request -> inactive
        existingAttrs.forEach(attr -> {
            if (!dedup.containsKey(attr.getName().toLowerCase())) {
                attr.setStatus(false);
            } else {
                attr.setStatus(true);

            }
        });
        attributeRepository.saveAll(existingAttrs);

        // Lấy tên attribute cũ còn active
        Set<String> existingNames = existingAttrs.stream()
                .filter(Attribute::getStatus)
                .map(a -> a.getName().toLowerCase())
                .collect(Collectors.toSet());

        // Thêm attribute mới nếu chưa có
        List<Attribute> newAttrs = dedup.values().stream()
                .filter(name -> !existingNames.contains(name.toLowerCase()))
                .map(name -> Attribute.builder()
                        .name(name)
                        .category(category)
                        .status(true)
                        .build())
                .toList();
        attributeRepository.saveAll(newAttrs);

        // Kết hợp danh sách attribute active
        List<Attribute> updatedAttrs = existingAttrs.stream()
                .filter(Attribute::getStatus)
                .collect(Collectors.toList());
        updatedAttrs.addAll(newAttrs);

        return updatedAttrs;
    }

}
