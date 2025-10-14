package iuh.fit.ecommerce.services;


import iuh.fit.ecommerce.dtos.request.customer.CustomerAddRequest;
import iuh.fit.ecommerce.dtos.request.customer.CustomerProfileRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.customer.CustomerResponse;
import iuh.fit.ecommerce.entities.Customer;

import java.time.LocalDate;
import java.util.List;

public interface CustomerService {
    CustomerResponse createCustomer(CustomerAddRequest customerAddRequest);
    CustomerResponse getCustomerById(long id);
    ResponseWithPagination<List<CustomerResponse>> getAllCustomers(int page, int limit, String name, String phone, String email, Boolean status, LocalDate startDate, LocalDate endDate);
    CustomerResponse updateCustomer(long id, CustomerProfileRequest request);
    void deleteCustomer(long id);
    void changeStatusCustomer(Long id);
    Customer getCustomerEntityById( Long id);
}
