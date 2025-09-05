package iuh.fit.ecommerce.dtos.request.brand;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandAddRequest {

    @NotBlank(message = "Brand name is required")
    private String name;

    private String description;

    private String image;

    private String origin;

    private Boolean status;
}
