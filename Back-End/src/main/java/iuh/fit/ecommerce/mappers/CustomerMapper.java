package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.request.customer.CustomerAddRequest;
import iuh.fit.ecommerce.dtos.response.customer.CustomerResponse;
import iuh.fit.ecommerce.entities.Customer;
import org.mapstruct.*;
import java.util.Collections;

@Mapper(componentModel = "spring", uses = {AddressMapper.class})
public interface CustomerMapper {
    @Mapping(target = "roles", expression = "java(java.util.Collections.singletonList(roleName))")
//    @Mapping(target = "rankingName", source = "ranking.name")
//    @Mapping(target = "addresses", source = "addresses")
    CustomerResponse toResponse(Customer customer, @Context String roleName);

//    @Mapping(target = "rankingName", source = "ranking.name")
//    @Mapping(target = "addresses", source = "addresses")
    CustomerResponse toResponse(Customer customer);

    @Mapping(target = "active", constant = "true")
    @Mapping(target = "totalSpending", constant = "0.0")
//    @Mapping(target = "ranking", ignore = true)
//    @Mapping(target = "addresses", source = "addresses")
    Customer toCustomer(CustomerAddRequest request);

//    default String getDefaultAddress(Customer customer) {
//        if (customer.getAddresses() == null || customer.getAddresses().isEmpty()) {
//            return null;
//        }
//        return customer.getAddresses().stream()
//                .filter(a -> Boolean.TRUE.equals(a.getIsDefault()))
//                .map(a -> a.getSubAddress())
//                .findFirst()
//                .orElse(null);
//    }
}