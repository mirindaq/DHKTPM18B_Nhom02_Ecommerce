package iuh.fit.ecommerce.dtos.response.promotion;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class PromotionResponse {
    private Long id;
    private String name;
    private String type;
    private String discountType;
    private Double discountValue;
    private Boolean active;
    private Integer priority;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
}
