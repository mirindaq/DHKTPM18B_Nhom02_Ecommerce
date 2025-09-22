package iuh.fit.ecommerce.dtos.response.variant;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantValueResponse {
    private Long id;
    private String value;
    private boolean status;
    private Long variantId;
    private String variantName;
}