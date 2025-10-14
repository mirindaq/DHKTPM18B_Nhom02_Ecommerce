package iuh.fit.ecommerce.dtos.request.voucher;

import iuh.fit.ecommerce.enums.DiscountType;
import iuh.fit.ecommerce.enums.VoucherType;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public class VoucherUpdateRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String name;

    @Size(max = 500)
    private String description;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotNull
    private DiscountType discountType;

    @NotNull
    @Positive
    private Double discountValue;

    @PositiveOrZero
    private Double minOrderAmount;

    @PositiveOrZero
    private Double maxDiscountAmount;

    @NotNull
    private Boolean active;

    @NotNull
    private VoucherType voucherType;
}
