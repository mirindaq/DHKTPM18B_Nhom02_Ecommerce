package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.request.customer.CustomerAddRequest;
import iuh.fit.ecommerce.dtos.response.customer.CustomerResponse;
import iuh.fit.ecommerce.entities.Address;
import iuh.fit.ecommerce.entities.Customer;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collections;

@Mapper(componentModel = "spring", imports = {java.time.LocalDate.class, java.util.Collections.class})
public interface CustomerMapper {

    // 🔹 Map khi có role truyền vào
    @Mapping(target = "roles", expression = "java(Collections.singletonList(roleName))")
    @Mapping(target = "totalSpending", source = "customer.totalSpending")
    @Mapping(target = "rankingName", expression = "java(customer.getRanking() != null ? customer.getRanking().getName() : null)")
    @Mapping(target = "address", expression = "java(getDefaultAddress(customer))")
    CustomerResponse toResponse(Customer customer, @Context String roleName);

    // 🔹 Map khi không có role
    @Mapping(target = "totalSpending", source = "totalSpending")
    @Mapping(target = "rankingName", expression = "java(customer.getRanking() != null ? customer.getRanking().getName() : null)")
    @Mapping(target = "address", expression = "java(getDefaultAddress(customer))")
    CustomerResponse toResponse(Customer customer);

    // 🔹 Map request → entity khi thêm mới khách hàng
    @Mapping(target = "active", constant = "true")
    Customer toCustomer(CustomerAddRequest request);

    // 🔹 Lấy địa chỉ mặc định
    default String getDefaultAddress(Customer customer) {
        if (customer == null || customer.getAddresses() == null || customer.getAddresses().isEmpty()) {
            return null;
        }

        Address defaultAddress = customer.getAddresses().stream()
                .filter(Address::getIsDefault)
                .findFirst()
                .orElse(customer.getAddresses().get(0));

        StringBuilder fullAddress = new StringBuilder();

        if (defaultAddress.getSubAddress() != null) {
            fullAddress.append(defaultAddress.getSubAddress());
        }

        if (defaultAddress.getWard() != null) {
            fullAddress.append(", ").append(defaultAddress.getWard().getName());
            if (defaultAddress.getWard().getProvince() != null) {
                fullAddress.append(", ").append(defaultAddress.getWard().getProvince().getName());
            }
        }

        return fullAddress.toString();
    }

}
