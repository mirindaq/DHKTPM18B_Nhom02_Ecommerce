package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.request.filterCriteria.CreateFilterCriteriaRequest;
import iuh.fit.ecommerce.dtos.request.filterCriteria.SetFilterValuesForCriteriaRequest;
import iuh.fit.ecommerce.dtos.response.filterCriteria.FilterCriteriaResponse;
import iuh.fit.ecommerce.dtos.response.filterCriteria.FilterValueResponse;
import iuh.fit.ecommerce.entities.Category;
import iuh.fit.ecommerce.entities.FilterCriteria;
import iuh.fit.ecommerce.entities.FilterValue;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.mappers.FilterCriteriaMapper;
import iuh.fit.ecommerce.repositories.CategoryRepository;
import iuh.fit.ecommerce.repositories.FilterCriteriaRepository;
import iuh.fit.ecommerce.repositories.FilterValueRepository;
import iuh.fit.ecommerce.repositories.ProductFilterValueRepository;
import iuh.fit.ecommerce.services.CategoryService;
import iuh.fit.ecommerce.services.FilterCriteriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FilterCriteriaServiceImpl implements FilterCriteriaService {

    private final FilterCriteriaRepository filterCriteriaRepository;
    private final FilterValueRepository filterValueRepository;
    private final CategoryService categoryService;
    private final CategoryRepository categoryRepository;
    private final FilterCriteriaMapper filterCriteriaMapper;
    private final ProductFilterValueRepository productFilterValueRepository;

    @Override
    @Transactional
    public FilterCriteriaResponse createFilterCriteria(CreateFilterCriteriaRequest request) {
        Category category = categoryService.getCategoryEntityById(request.getCategoryId());

        FilterCriteria filterCriteria = FilterCriteria.builder()
                .name(request.getName())
                .category(category)
                .build();

        FilterCriteria saved = filterCriteriaRepository.save(filterCriteria);

        // Thêm các giá trị nếu có
        if (request.getValues() != null && !request.getValues().isEmpty()) {
            List<FilterValue> filterValues = request.getValues().stream()
                    .map(value -> FilterValue.builder()
                            .filterCriteria(saved)
                            .value(value)
                            .build())
                    .collect(Collectors.toList());
            filterValueRepository.saveAll(filterValues);
        }

        return filterCriteriaMapper.toResponse(saved);
    }

    @Override
    public List<FilterCriteriaResponse> getFilterCriteriaByCategoryId(Long categoryId, String name) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }

        List<FilterCriteria> filterCriteriaList = filterCriteriaRepository.findByCategoryIdAndName(categoryId, name);
        return filterCriteriaMapper.toResponseList(filterCriteriaList);
    }

    @Override
    public List<FilterCriteriaResponse> getFilterCriteriaByCategorySlug(String categorySlug, String name) {
        Category category = categoryRepository.findBySlug(categorySlug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + categorySlug));

        List<FilterCriteria> filterCriteriaList = filterCriteriaRepository.findByCategoryIdAndName(category.getId(), name);
        return filterCriteriaMapper.toResponseList(filterCriteriaList);
    }

    @Override
    @Transactional
    public void setFilterValuesForCriteria(SetFilterValuesForCriteriaRequest request) {
        FilterCriteria filterCriteria = getFilterCriteriaEntityById(request.getFilterCriteriaId());

        filterValueRepository.deleteAllByFilterCriteriaId(request.getFilterCriteriaId());

        if (request.getValues() == null || request.getValues().isEmpty()) {
            return;
        }

        List<FilterValue> newFilterValues = request.getValues().stream()
                .map(value -> FilterValue.builder()
                        .filterCriteria(filterCriteria)
                        .value(value)
                        .build())
                .collect(Collectors.toList());

        filterValueRepository.saveAll(newFilterValues);
    }

    @Override
    public List<FilterValueResponse> getFilterValuesByCriteriaId(Long filterCriteriaId, String value) {
        if (!filterCriteriaRepository.existsById(filterCriteriaId)) {
            throw new ResourceNotFoundException("FilterCriteria not found with id: " + filterCriteriaId);
        }

        List<FilterValue> filterValues = filterValueRepository.findByFilterCriteriaIdAndValue(filterCriteriaId, value);
        return filterCriteriaMapper.toFilterValueResponseList(filterValues);
    }

    @Override
    public List<FilterValueResponse> getFilterValuesByProductId(Long productId) {
        List<FilterValue> filterValues = productFilterValueRepository.findFilterValuesByProductId(productId);
        return filterCriteriaMapper.toFilterValueResponseList(filterValues);
    }

    @Override
    @Transactional
    public void deleteFilterCriteria(Long id) {
        FilterCriteria filterCriteria = getFilterCriteriaEntityById(id);
        filterCriteriaRepository.delete(filterCriteria);
    }

    private FilterCriteria getFilterCriteriaEntityById(Long id) {
        return filterCriteriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FilterCriteria not found with id: " + id));
    }
}

