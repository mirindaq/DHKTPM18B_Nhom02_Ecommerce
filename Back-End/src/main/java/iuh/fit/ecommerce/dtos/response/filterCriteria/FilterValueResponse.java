package iuh.fit.ecommerce.dtos.response.filterCriteria;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterValueResponse {

    private Long id;

    private String value;

    private Long filterCriteriaId;
}

