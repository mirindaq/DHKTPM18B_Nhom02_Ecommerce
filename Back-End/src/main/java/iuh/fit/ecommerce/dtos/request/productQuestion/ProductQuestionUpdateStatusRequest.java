package iuh.fit.ecommerce.dtos.request.productQuestion;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductQuestionUpdateStatusRequest {
    @NotNull(message = "Status cannot be null")
    private Boolean status;
}
