package iuh.fit.ecommerce.services;


import iuh.fit.ecommerce.dtos.request.voucher.VoucherAddRequest;
import iuh.fit.ecommerce.dtos.request.voucher.VoucherUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.voucher.VoucherAvailableResponse;
import iuh.fit.ecommerce.dtos.response.voucher.VoucherResponse;
import iuh.fit.ecommerce.entities.Voucher;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;

public interface VoucherService {
    VoucherResponse createVoucher( VoucherAddRequest request);

    VoucherResponse getVoucherById(Long id);

    ResponseWithPagination<List<VoucherResponse>> getAllVouchers(int page, int limit, String name, String type, Boolean active, LocalDate startDate, LocalDate endDate);

    VoucherResponse updateVoucher(Long id,  VoucherUpdateRequest request);

    void changeStatusVoucher(Long id);

    void sendVoucherToCustomers(Long id);

    Voucher getVoucherEntityById(Long id);

    List<VoucherAvailableResponse> getAvailableVouchersForCustomer();
}
