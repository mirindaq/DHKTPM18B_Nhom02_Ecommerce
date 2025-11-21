package iuh.fit.ecommerce.dtos.response.filterCriteria;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterCriteriaResponse {

    private Long id;

    private String name;

    private Long categoryId;

    private List<FilterValueResponse> filterValues;
}

