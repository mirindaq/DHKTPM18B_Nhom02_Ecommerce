package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.request.customer.CustomerAddRequest;
import iuh.fit.ecommerce.dtos.response.customer.CustomerResponse;
import iuh.fit.ecommerce.entities.Customer;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    @Mapping(target = "roles", expression = "java(java.util.Collections.singletonList(roleName))")
    @Mapping(target = "rankingName", source = "ranking.name")
    CustomerResponse toResponse(Customer customer, @Context String roleName);

    @Mapping(target = "rankingName", source = "ranking.name")
    CustomerResponse toResponse(Customer customer);

    @Mapping(target = "active", constant = "true")
    @Mapping(target = "totalSpending", constant = "0.0")
    @Mapping(target = "ranking", ignore = true)
    Customer toCustomer(CustomerAddRequest request);

}