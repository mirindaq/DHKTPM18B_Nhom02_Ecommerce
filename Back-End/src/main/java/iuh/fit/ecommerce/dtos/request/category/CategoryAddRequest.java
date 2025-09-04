package iuh.fit.ecommerce.dtos.request.category;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CategoryAddRequest {
    @NotBlank(message = "Name cannot be blank")
    private String name;

    private String description;

    private String image;

    private Boolean status;

    @Valid
    private List<AttributeAddRequest> attributes;
}