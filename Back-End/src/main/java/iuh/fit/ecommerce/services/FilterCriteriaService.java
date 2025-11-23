package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.filterCriteria.CreateFilterCriteriaRequest;
import iuh.fit.ecommerce.dtos.request.filterCriteria.SetFilterValuesForCriteriaRequest;
import iuh.fit.ecommerce.dtos.response.filterCriteria.FilterCriteriaResponse;
import iuh.fit.ecommerce.dtos.response.filterCriteria.FilterValueResponse;

import java.util.List;

public interface FilterCriteriaService {

    FilterCriteriaResponse createFilterCriteria(CreateFilterCriteriaRequest request);

    List<FilterCriteriaResponse> getFilterCriteriaByCategoryId(Long categoryId, String name);

    List<FilterCriteriaResponse> getFilterCriteriaByCategorySlug(String categorySlug, String name);

    void setFilterValuesForCriteria(SetFilterValuesForCriteriaRequest request);

    List<FilterValueResponse> getFilterValuesByCriteriaId(Long filterCriteriaId, String value);

    List<FilterValueResponse> getFilterValuesByProductId(Long productId);

    void deleteFilterCriteria(Long id);
}

