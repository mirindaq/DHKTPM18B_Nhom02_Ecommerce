package iuh.fit.ecommerce.dtos.response.variant;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantResponse {
    private Long id;
    private String name;
    private boolean status;
    private List<VariantValueResponse> variantValues;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
}
