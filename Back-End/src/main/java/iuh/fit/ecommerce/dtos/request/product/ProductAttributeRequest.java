package iuh.fit.ecommerce.dtos.request.product;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
public class ProductAttributeRequest {

    @NotNull(message = "AttributeId không được null")
    private Long attributeId;

    @NotBlank(message = "Giá trị attribute không được rỗng")
    private String value;
}
