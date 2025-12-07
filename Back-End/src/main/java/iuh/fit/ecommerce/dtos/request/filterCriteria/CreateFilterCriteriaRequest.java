package iuh.fit.ecommerce.dtos.request.filterCriteria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateFilterCriteriaRequest {

    @NotBlank(message = "Tên tiêu chí lọc không được để trống")
    private String name;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private List<String> values;
}

