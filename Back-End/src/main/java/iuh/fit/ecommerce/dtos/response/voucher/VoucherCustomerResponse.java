package iuh.fit.ecommerce.dtos.response.voucher;

import iuh.fit.ecommerce.enums.VoucherCustomerStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoucherCustomerResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String email;
    private String code;
    private VoucherCustomerStatus voucherCustomerStatus;
}
