package iuh.fit.ecommerce.dtos.response.brand;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandResponse {

    private Long id;

    private String name;

    private String description;

    private String image;

    private String origin;

    private boolean status;
}
