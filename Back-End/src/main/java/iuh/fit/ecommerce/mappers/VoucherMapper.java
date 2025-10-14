package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.request.voucher.VoucherAddRequest;
import iuh.fit.ecommerce.dtos.response.voucher.RankVoucherResponse;
import iuh.fit.ecommerce.dtos.response.voucher.VoucherAvailableResponse;
import iuh.fit.ecommerce.dtos.response.voucher.VoucherCustomerResponse;
import iuh.fit.ecommerce.dtos.response.voucher.VoucherResponse;
import iuh.fit.ecommerce.entities.Ranking;
import iuh.fit.ecommerce.entities.Voucher;
import iuh.fit.ecommerce.entities.VoucherCustomer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {RankingMapper.class})
public interface VoucherMapper {

    @Mapping(target = "code", ignore = true)
    Voucher toVoucher(VoucherAddRequest voucherAddRequest);

    @Mapping(target = "voucherCustomers", source = "voucherCustomers")
    @Mapping(target = "ranking", source = "ranking")
    VoucherResponse toResponse(Voucher voucher);

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.fullName")
    @Mapping(target = "email", source = "customer.email")
    VoucherCustomerResponse toVoucherCustomerResponse(VoucherCustomer voucherCustomer);

    VoucherAvailableResponse toVoucherAvailableResponse(Voucher voucher);

    List<VoucherCustomerResponse> toVoucherCustomerResponses(List<VoucherCustomer> voucherCustomers);

}
