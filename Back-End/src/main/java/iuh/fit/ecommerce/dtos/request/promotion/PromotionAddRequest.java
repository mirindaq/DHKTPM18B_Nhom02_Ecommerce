package iuh.fit.ecommerce.dtos.request.promotion;

import iuh.fit.ecommerce.enums.DiscountType;
import iuh.fit.ecommerce.enums.PromotionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class PromotionAddRequest {
    @NotBlank(message = "Promotion name must not be blank")
    @Size(max = 255, message = "Promotion name must be at most 255 characters")
    private String name;

    @NotNull(message = "Promotion type must not be blank")
    private PromotionType promotionType;

    @NotNull(message = "Discount must not be null")
    @Positive(message = "Discount must be greater than 0")
    private Double discount;

    @NotNull(message = "Active status must not be null")
    private Boolean active;

    @NotNull(message = "Priority must not be null")
    @Min(value = 1, message = "Priority must be at least 1")
    private Integer priority;

    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;

    @NotNull(message = "Start date must not be null")
    private LocalDate startDate;

    @NotNull(message = "End date must not be null")
    private LocalDate endDate;

    @Valid
    private List<PromotionTargetRequest> promotionTargets;
}
