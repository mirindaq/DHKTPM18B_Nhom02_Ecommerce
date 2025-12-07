package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.filterCriteria.FilterCriteriaResponse;
import iuh.fit.ecommerce.dtos.response.filterCriteria.FilterValueResponse;
import iuh.fit.ecommerce.entities.FilterCriteria;
import iuh.fit.ecommerce.entities.FilterValue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FilterCriteriaMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "filterValues", source = "filterValues")
    FilterCriteriaResponse toResponse(FilterCriteria filterCriteria);

    List<FilterCriteriaResponse> toResponseList(List<FilterCriteria> filterCriteriaList);

    @Mapping(target = "filterCriteriaId", source = "filterCriteria.id")
    FilterValueResponse toResponse(FilterValue filterValue);

    List<FilterValueResponse> toFilterValueResponseList(List<FilterValue> filterValues);
}

