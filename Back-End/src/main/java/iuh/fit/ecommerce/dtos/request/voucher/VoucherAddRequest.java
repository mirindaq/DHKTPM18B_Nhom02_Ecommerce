package iuh.fit.ecommerce.dtos.request.voucher;

import iuh.fit.ecommerce.enums.VoucherType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class VoucherAddRequest {

    @NotBlank(message = "Voucher name must not be blank")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Start date must not be null")
    private LocalDate startDate;

    @NotNull(message = "End date must not be null")
    private LocalDate endDate;

    @NotNull(message = "Discount value must not be null")
    @Positive(message = "Discount value must be greater than 0")
    private Double discount;

    @PositiveOrZero(message = "Minimum order amount must be zero or positive")
    private Double minOrderAmount;

    @PositiveOrZero(message = "Maximum discount amount must be zero or positive")
    private Double maxDiscountAmount;

    @NotNull(message = "Active status must not be null")
    private Boolean active;

    @NotNull(message = "Voucher type must not be null")
    private VoucherType voucherType;

    private String code;

    @Valid
    private List<VoucherCustomerRequest> voucherCustomers;

    private Long rankId;
}
