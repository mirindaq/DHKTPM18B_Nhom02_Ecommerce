package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.variantCategory.SetVariantsForCategoryRequest;
import iuh.fit.ecommerce.dtos.response.variantCategory.VariantCategoryResponse;
import iuh.fit.ecommerce.entities.Category;
import iuh.fit.ecommerce.entities.Variant;
import iuh.fit.ecommerce.entities.VariantCategory;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.VariantCategoryMapper;
import iuh.fit.ecommerce.repositories.CategoryRepository;
import iuh.fit.ecommerce.repositories.VariantCategoryRepository;
import iuh.fit.ecommerce.repositories.VariantRepository;
import iuh.fit.ecommerce.services.CategoryService;
import iuh.fit.ecommerce.services.VariantCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VariantCategoryServiceImpl implements VariantCategoryService {

    private final VariantCategoryRepository variantCategoryRepository;
    private final VariantRepository variantRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;
    private final VariantCategoryMapper variantCategoryMapper;

    @Override
    @Transactional
    public void setVariantsForCategory(SetVariantsForCategoryRequest request) {
        Category category = categoryService.getCategoryEntityById(request.getCategoryId());

        variantCategoryRepository.deleteAllByCategoryId(request.getCategoryId());

        if (request.getVariantIds() == null || request.getVariantIds().isEmpty()) {
            return;
        }

        List<Variant> variants = variantRepository.findAllById(request.getVariantIds());

        List<VariantCategory> newAssignments = variants.stream()
                .map(variant -> VariantCategory.builder()
                        .category(category)
                        .variant(variant)
                        .build())
                .collect(Collectors.toList());

        variantCategoryRepository.saveAll(newAssignments);
    }

    @Override
    public List<VariantCategoryResponse> getVariantCategoriesByCategoryId(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }

        List<VariantCategory> variantCategories = variantCategoryRepository.findVariantCategoriesByCategoryId(categoryId);
        return variantCategories.stream()
                .map(variantCategoryMapper::toResponse)
                .collect(Collectors.toList());
    }
}

