package iuh.fit.ecommerce.dtos.request.attribute;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
public class AttributeValueAddRequest {

    @NotNull(message = "Attribute ID is required")
    private Long attributeId;

    @NotBlank(message = "Value is required")
    private String value;

    private Integer orderIndex;

    private Boolean status;
}
