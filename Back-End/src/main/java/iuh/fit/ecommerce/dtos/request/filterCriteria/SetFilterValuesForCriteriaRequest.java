package iuh.fit.ecommerce.dtos.request.filterCriteria;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SetFilterValuesForCriteriaRequest {

    @NotNull(message = "Filter Criteria ID is required")
    private Long filterCriteriaId;

    @NotNull(message = "List filter value cannot be null")
    @Size(min = 0, message = "List filter value must have at least 0 value")
    private List<String> values;
}

